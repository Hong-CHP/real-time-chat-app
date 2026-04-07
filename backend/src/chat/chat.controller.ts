import { Controller, Get, Query } from "@nestjs/common";
import { ChatService } from "./chat.service";

@Controller()
export class ChatController {
	constructor(private readonly chatService: ChatService){}
	
	@Get('messages')
	getMessages(
		@Query('userId') userId: string,
		@Query('friendId') friendId: string,
	) {
		return this.chatService.getMessages(Number(userId), Number(friendId))
	}
}
