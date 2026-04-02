import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { FriendService } from './friend.service';
import { CreateFriendDto } from './dto/create-friend.dto';
import { UpdateFriendDto } from './dto/update-friend.dto';
import { AuthGuard } from '@nestjs/passport';
import { OPTIONAL_PROPERTY_DEPS_METADATA } from '@nestjs/common/constants';

@Controller('friend')
@UseGuards(AuthGuard('jwt'))
export class FriendController {
  constructor(private readonly friendService: FriendService) {}

  @Post('request')
  sendRequest(@Req() req, @Body() createFriendDto: CreateFriendDto) {
    return this.friendService.sendRequest(req.user.id, createFriendDto);
  }

  @Get('requests')
  getRequests(@Req() req) {
    return this.friendService.getRequests(req.user.id);
  }

  @Post('accept/:id')
  accept(@Req() req, @Param('id') requestId: string, @Body() updateFriendDto: UpdateFriendDto) {
    return this.friendService.acceptRequest(req.user.id, Number(requestId), updateFriendDto)
  }

  @Get('list')
  getFriends(@Req() req) {
    return this.friendService.getFriends(req.user.id);
  }

  @Delete(':id')
  blockFriend(@Req() req, @Param('id') blockId: string, @Body() updateFriendDto: UpdateFriendDto) {
    return this.friendService.blockFriend(req.user.id, Number(blockId), updateFriendDto);
  }
}
