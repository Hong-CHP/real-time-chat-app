import { BadRequestException, Injectable } from "@nestjs/common";
import { NotFoundError } from "rxjs";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class RoomService{
	constructor(private readonly prisma: PrismaService){}
	
	async create(name: string, users: number[]) {
		if (!users || users.length < 2)
			throw new Error("At least 2 users are required.")
		return this.prisma.room.create({
			data: {
				name: name,
				type: 'GROUP',
				members: {
					create: users.map(userId=>({user: {connect: {id :userId}}}))
				}
			},
			include: {
				members: true
			}
		})
	}

	async findAll() {
		return this.prisma.room.findMany({
			include: {
				members: true,
			}
		})
	}

	async getPrivateRoom(userId: number, friendId: number) {
		const key = [userId, friendId].sort().join('_')
		const room = await this.prisma.room.findFirst({
			where: {
				uniqueKey: key,	
			},
		})
		if (!room)
			throw new Error("Room not found")
		return room
	}
}