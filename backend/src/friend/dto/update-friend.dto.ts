import { PartialType } from '@nestjs/mapped-types';
import { CreateFriendDto } from './create-friend.dto';
import { IsEnum } from 'class-validator';

export enum FriendStatus {
	PENDING = 'PENDING',
	ACCEPTED ='ACCEPTED',
	BLOCKED = 'BLOCKED',
}
export class UpdateFriendDto extends PartialType(CreateFriendDto) {
	@IsEnum(FriendStatus)
	status: FriendStatus
}
