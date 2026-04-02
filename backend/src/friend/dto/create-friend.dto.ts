import { IsInt } from "class-validator";

export class CreateFriendDto {
	@IsInt()
	friendId: number
}
