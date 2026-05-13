import { BadRequestException, Injectable } from '@nestjs/common';
import { NotFoundError } from 'rxjs';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RoomService {
  constructor(private readonly prisma: PrismaService) {}

  async create(name: string, users: number[]) {
    if (!users || users.length < 2)
      throw new Error('At least 2 users are required.');
    return this.prisma.room.create({
      data: {
        name: name,
        type: 'GROUP',
        members: {
          create: users.map((userId) => ({
            user: { connect: { id: userId } },
          })),
        },
      },
      include: {
        members: true,
      },
    });
  }

  async findAll(userId: number) {
    const rooms = await this.prisma.room.findMany({
      where: {
        members: {
          some: { userId: userId },
        },
      },
      include: {
        members: {
          include: { user: true },
        },
      },
    });
    return Promise.all(
      rooms.map(async (room) => {
        const lastMessage = await this.prisma.message.findFirst({
          where: {
            roomId: room.id,
          },
          orderBy: { id: 'desc' },
        });
        const member = room.members.find((m) => m.userId === userId);
        const lastReadMessageId = member?.lastReadMessageId ?? 0;
        const unReadCount = await this.prisma.message.count({
          where: {
            roomId: room.id,
            id: { gt: lastReadMessageId },
          },
        });
        return {
          id: room.id,
          name: room.name,
          type: room.type,
          members: room.members,
          lastMessage: lastMessage?.content ?? '',
          unReadCount,
        };
      }),
    );
  }
}
