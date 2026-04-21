import { Module } from '@nestjs/common';
import { FriendService } from './friend.service';
import { FriendController } from './friend.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { JwtStrategy } from 'src/auth/jwt.strategy';
import { ChatModule } from 'src/chat/chat.module';
import { RoomService } from 'src/room/room.service';

@Module({
  imports: [PrismaModule, ChatModule],
  controllers: [FriendController],
  providers: [FriendService, JwtStrategy],
})
export class FriendModule {}
