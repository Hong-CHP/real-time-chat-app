import { Controller, Get, ParseIntPipe, Query, Req } from '@nestjs/common';
import { ChatService } from './chat.service';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller()
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('messages')
  getMessages(@Req() req, @Query('roomId', ParseIntPipe) roomId: number) {
    return this.chatService.getMessages(req.user.id, roomId);
  }
}
