import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class ChatService {
	constructor (private readonly prisma: PrismaService){}

	async getMessages(userId: number, roomId: number) {
		const messages = await this.prisma.message.findMany({
			where: {
				roomId,
				room: {
					members: {
						some: {userId : userId}
					}
				}},
			orderBy: {
				createdAt: 'asc'
			}
		})
		return messages
	}
}