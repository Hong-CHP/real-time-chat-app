import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  async getMessages(userId: number, roomId: number) {
    const isMember = await this.prisma.room.findFirst({
      where: {
        id: roomId,
        members: {
          some: { userId: userId },
        },
      },
    });
    if (!isMember) throw new ForbiddenException();
    const messages = await this.prisma.message.findMany({
      where: {
        roomId,
        room: {
          members: {
            some: { userId: userId },
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
    return messages;
  }
}
