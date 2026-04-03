import { BadRequestException, ConflictException, ForbiddenException, Injectable } from '@nestjs/common';
import { CreateFriendDto } from './dto/create-friend.dto';
import { UpdateFriendDto } from './dto/update-friend.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ChatGateway } from 'src/chat/chat.gateway';

@Injectable()
export class FriendService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly chatGateway: ChatGateway) {}
  async sendRequest(userId: number, createFriendDto: CreateFriendDto) {
    Number(createFriendDto.friendId)
    console.log(userId, createFriendDto.friendId)
    if (userId === createFriendDto.friendId)
      throw new BadRequestException("Cannot add yourself")
    const exist = await this.prisma.friend.findFirst({
      where: {
        OR: [
          {userId, friendId: createFriendDto.friendId, status: 'ACCEPTED'},
          {userId: createFriendDto.friendId, friendId: userId, status: 'ACCEPTED'},
        ],
      },
    })
    if (exist) {
      console.log("error")
      throw new BadRequestException("Your are friends already.")
    }
    try {
      const request = await this.prisma.friend.create({
        data: {
          userId,
          friendId: createFriendDto.friendId,
          status: 'PENDING',
        }
      })
      this.chatGateway.sendFriendRequest(createFriendDto.friendId, {
        fromUserId: userId,
      })
      return request
    } catch (e : any) {
      if (e.code === "P2002")
          throw new ConflictException("The request is already exist, please wait the response.")
    }
  }

  async getRequests(userId: number) {
    const requests = await this.prisma.friend.findMany({
      where: {
        friendId: userId,
        status: 'PENDING',
      },
      include: {
        user: true,
      }
    })
    return requests
  }

  async acceptRequest(userId: number, requestId: number, updateFriendDto: UpdateFriendDto) {
    const request = await this.prisma.friend.findFirst({
      where: {
        userId: requestId,
        friendId: userId,
        status: 'PENDING',
      },
    })
    if (!request)
      throw new ForbiddenException("The request is not exist.")
    const data = {...updateFriendDto}
    return  (
      this.prisma.friend.update({
        where: {id: request.id}, 
        data: {
          status: 'ACCEPTED'
        }
      })
    )
  }

  async getFriends(userId: number) {
    const friends = await this.prisma.friend.findMany({
        where: {
          OR: [
            {
              friendId: userId,
              status: 'ACCEPTED',
            },
            {
              userId,
              status: 'ACCEPTED',
            }
          ]
        },
        include: {
          user: true,
          friend: true,
        }
    })
    return (
      friends.map(ele=>{
        const isMe = ele.userId === userId
        return {
          id: ele.id,
          status: ele.status,
          friend: isMe ? ele.friend : ele.user
        }
      })
    )
  }

  async isFriend(userId: number, targetId: number) {
    const friend = await this.prisma.friend.findFirst({
      where: {
        OR: [
          {userId, friendId: targetId, status: 'ACCEPTED'},
          {friendId: userId, userId: targetId, status: 'ACCEPTED'}
        ]
      }
    })
    return !!friend
  }

  async blockFriend(userId: number, blockId: number, updateFriendDto: UpdateFriendDto) {
    const relation = await this.prisma.friend.findFirst({
      where: {
        OR: [
          {userId, friendId: blockId},
          {friendId: userId, userId: blockId}
        ]
      }
    })
    if (!relation)
      throw new BadRequestException("The friend is not found in your list.")
    const data = {...updateFriendDto}
    return  (
      this.prisma.friend.update({
        where: { id: relation.id }, 
        data: { status: 'BLOCKED' },
      })
    )
  }
}