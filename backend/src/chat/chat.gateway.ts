import {
  BadRequestException,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PrismaService } from 'src/prisma/prisma.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway {
  constructor(
    private jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  @WebSocketServer()
  server: Server;

  private users = new Map<number, Set<string>>();

  handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token;
      if (!token) {
        client.disconnect();
        return;
      }
      const payload = this.jwtService.verify(token);
      const userId = payload.sub;
      client.data.userId = userId;
      let sockets = this.users.get(userId);
      if (!sockets) {
        sockets = new Set<string>();
        this.users.set(userId, sockets);
      }
      sockets.add(client.id);
    } catch (err: any) {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    for (const [userId, sockets] of this.users.entries()) {
      if (sockets.has(client.id)) {
        sockets.delete(client.id);
        if (sockets.size === 0) this.users.delete(userId);
        break;
      }
    }
    console.log('User disconnected:', client.id);
  }

  sendFriendRequest(targetId: number, data: any) {
    const targetSockets = this.users.get(targetId);
    if (targetSockets) {
      targetSockets.forEach((socket) => {
        this.server.to(socket).emit('friend_request', data);
      });
    }
  }

  @SubscribeMessage('join-room')
  async handleJoinRoom(
    @MessageBody() data: { roomId: number },
    @ConnectedSocket() client: Socket,
  ) {
    const isMember = await this.prisma.roomMember.findFirst({
      where: {
        roomId: data.roomId,
        userId: client.data.userId,
      },
    });
    if (!isMember) {
      return { error: 'No permission' };
    }
    const lastMessage = await this.prisma.message.findFirst({
      where: { roomId: data.roomId },
      orderBy: { id: 'desc' },
    });
    if (lastMessage) {
      await this.prisma.roomMember.update({
        where: {
          userId_roomId: {
            userId: client.data.userId,
            roomId: data.roomId,
          },
        },
        data: {
          lastReadMessageId: lastMessage.id,
        },
      });
    }
    const room = `room_${data.roomId}`;
    const currentRoom = client.data.currentRoom;
    if (currentRoom) client.leave(currentRoom);
    client.join(room);
    client.data.currentRoom = room;
    return { success: true };
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket,
  ) {
    const content = data.content;
    const roomId = Number(data.roomId);
    if (!roomId || roomId === undefined)
      throw new BadRequestException('Invalid roomId.');
    const senderId = client.data.userId;
    const existRoomId = await this.prisma.room.findUnique({
      where: { id: roomId },
    });
    if (!existRoomId) throw new BadRequestException('This room is not exist.');
    const isMember = await this.prisma.roomMember.findFirst({
      where: {
        roomId: roomId,
        userId: client.data.userId,
      },
    });
    if (!isMember)
      throw new UnauthorizedException('You are not the member of this room.');
    const message = await this.prisma.message.create({
      data: {
        content,
        senderId,
        roomId,
      },
    });
    const room = `room_${roomId}`;
    const socketInRoom = await this.server.in(room).fetchSockets();
    const activeUserIdInRoom = [
      ...new Set(socketInRoom.map((s) => s.data.userId)),
    ];
    if (activeUserIdInRoom.length > 0) {
      await this.prisma.roomMember.updateMany({
        where: {
          roomId: roomId,
          userId: { in: activeUserIdInRoom },
        },
        data: {
          lastReadMessageId: message.id,
        },
      });
    }
    this.server.to(room).emit('receiveMessage', message);
  }
}
