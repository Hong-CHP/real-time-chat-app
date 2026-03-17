import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor (private prisma: PrismaService) {};
  async create(createUserDto: CreateUserDto) {
    const hashedPwd = await bcrypt.hash(createUserDto.password, 10);
    return this.prisma.user.create({
	data: {
		email: createUserDto.email,
		password: hashedPwd,
	}	
    });
  }

  findAll() {
    return this.prisma.user.findMany();
  }

  findOne(id: number) {
    return this.prisma.user.findUnique({
		where: {id},
	});
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
	const data: any = {...updateUserDto};
	if (updateUserDto.password) {
		data.password = await bcrypt.hash(updateUserDto.password, 10)
	}
	return this.prisma.user.update({
		where: {id},
		data
	});
  }

  remove(id: number) {
    return this.prisma.user.delete({
		where: {id},
	});
  }
}
