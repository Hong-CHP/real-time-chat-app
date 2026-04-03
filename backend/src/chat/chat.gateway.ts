import { JwtService } from '@nestjs/jwt'
import {
	WebSocketGateway,
	WebSocketServer,
	SubscribeMessage,
	MessageBody,
	ConnectedSocket
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'

@WebSocketGateway({
	cors: {
		origin: '*',
	}
})
export	class ChatGateway {
	constructor(private jwtService: JwtService) {}

	@WebSocketServer()
	server: Server

	private users = new Map<number, string>()

	handleConnection(client: Socket) {
		try {
			const token = client.handshake.auth.token
			if (!token) {
				client.disconnect()
				return 
			}
			const payload = this.jwtService.verify(token)
			const userId = payload.sub
			client.data.userId = userId
			this.users.set(userId, client.id)
		} catch (err: any) {
			client.disconnect()
		}
	}

	handleDisconnect(client: Socket) {
		for (const [userId, socketId] of this.users.entries()) {
			if (socketId === client.id) {
				this.users.delete(userId)
				break
			}
		}
		console.log('User disconnected:', client.id)
	}

	sendFriendRequest(targetId: number, data: any) {
		const targetSocketId = this.users.get(targetId)
		if (targetSocketId)
			this.server.to(targetSocketId).emit('friend_request', data)
	}

	@SubscribeMessage('sendMessage')
	handleMessage(
		@MessageBody() data: any,
		@ConnectedSocket() client: Socket
	) {
		const {content, receiverId} = data
		const senderId = client.data.userId
		const receiverSocketId = this.users.get(receiverId)
		const message = {
			content,
			receiverId,
			senderId,
		}
		if (receiverSocketId) {
			this.server.to(receiverSocketId).emit("receiveMessage", message)
		}
		client.emit('receiveMessage', message)
	}
}