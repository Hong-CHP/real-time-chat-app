import { Body, Controller, Get, ParseIntPipe, Post, Query, Req, UseGuards } from "@nestjs/common";
import { RoomService } from "./room.service";
import { CreateRoomDto } from "./dto/create-room.dto";
import { AuthGuard } from "@nestjs/passport";
import { Friend } from "src/friend/entities/friend.entity";
import { UserScalarFieldEnum } from "generated/prisma/internal/prismaNamespace";

@UseGuards(AuthGuard('jwt'))
@Controller('rooms')
export class RoomController{
	constructor(
		private readonly roomService: RoomService,
	){}

	@Post()
	async create(@Body() body: CreateRoomDto) {
		return this.roomService.create(body.name, body.users)
	}

	@Get('private')
	async getPrivateRoom(
		@Req() req,
		@Query('friendId', ParseIntPipe) friendId : number ) {
			return this.roomService.getPrivateRoom(req.user.id, friendId)
	}

	@Get()
	async findAll() {
		return this.roomService.findAll()
	}

}