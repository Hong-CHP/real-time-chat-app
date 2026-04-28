import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';

@Injectable()
export class UsersService {
  constructor (private prisma: PrismaService) {};
  async create(createUserDto: CreateUserDto) {
    try {
      const hashedPwd = await bcrypt.hash(createUserDto.password, 10);
      return this.prisma.user.create({
	      data: {
		      email: createUserDto.email,
		      password: hashedPwd,
          name: createUserDto.name,
	      }	
      });
    } catch (err) {
      console.error(err)
      throw err
    }
  }

  findById(myId: number) {
    return this.prisma.user.findUnique({
      where: {id: myId},
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        friends: true,
      }
    })
  }

  async updateMe(myId: number, updateUserDto: UpdateUserDto) {
    const {name, email, password} = updateUserDto
    const data: any = {name, email}
    if (password !== undefined)
      data.password = await bcrypt.hash(password, 10)
    const updated = await this.prisma.user.update({
      where: {id: myId},
      data,
    })
    const {password:_, ...me} = updated
    return me
  }

  async removeMe(myId: number) {
    return this.prisma.user.delete({
      where: {id: myId}
    })
  }

  async findAll() {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
      }
    });
    return users
  }

  findOne(id: number) {
    return this.prisma.user.findUnique({
		  where: {id},
      select: {
        id: true,
        name: true,
        email: true,
      }
	  });
  }

  findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: {email},
      select: {
        id: true,
        name: true,
        email: true,
      }
    })
  }

  findMany(keyword: string, userId: number) {
    return this.prisma.user.findMany({
      where: {
        AND: [
          {
            id : { not: userId },
          },
          {
            OR: [
              {name: {contains: keyword}},
              {email: {contains: keyword}},
            ]
          }
        ]
      },
      select: {
        id: true,
        name: true,
        email: true,
      }
    })
  }

  async updateOne(id: number, updateUserDto: UpdateUserDto) {
    const data: any = {...updateUserDto};
    if (updateUserDto.password) {
    	data.password = await bcrypt.hash(updateUserDto.password, 10)
    }
    const updatedUser = await this.prisma.user.update({
    	where: {id},
    	data
    });

    const {password:_, ...res} = updatedUser
    return res
  }

  removeOne(id: number) {
    return this.prisma.user.delete({
		where: {id},
	});
  }
}
