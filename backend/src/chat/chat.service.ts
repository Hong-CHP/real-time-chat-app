import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class ChatService {
	constructor (private readonly prisma: PrismaService){}

	async getMessages(userId: number, friendId: number) {
		const messages = await this.prisma.message.findMany({
			where: {
				OR: [
					{ senderId: userId, receiverId: friendId,},
					{ senderId: friendId, receiverId: userId,}
				]
			},
			orderBy: {
				createdAt: 'asc'
			}
		})
		return messages
	}
}