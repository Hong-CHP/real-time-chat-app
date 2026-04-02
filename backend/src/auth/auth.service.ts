import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
// import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
	constructor(
		private readonly usersService : UsersService,
		// private readonly prismaService: PrismaService,
		private readonly jwtService: JwtService,
	) {};

	async register(createUserDto: any) {
		const user = await this.usersService.create(createUserDto)
		const {password: _, ...res} = user
		return res
	}

	async login(user : any) {
		const payload = {email: user.email, sub: user.id}
		const token = this.jwtService.sign(payload)
		return {
			access_token: token,
		}
	}

	async validateUser(email: string, password: string) {
		const user = await this.usersService.findByEmail(email)
		if (user && await bcrypt.compare(password, user.password)) {
			const {password: _, ...res} = user
			return res
		}
		return null
	}
}
