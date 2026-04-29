import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
// import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { NotFoundError } from 'rxjs';

@Injectable()
export class AuthService {
	constructor(
		private readonly usersService : UsersService,
		private readonly prisma: PrismaService,
		private readonly jwtService: JwtService,
	) {};

	async register(createUserDto: any) {
		const user = await this.usersService.create(createUserDto)
		const {password: _, ...res} = user
		return res
	}

	async login(user : any) {
		const payload = {email: user.email, sub: user.id, role: user.role}
		const access_token = this.jwtService.sign(payload, {expiresIn: '15m'})
		const refresh_token = this.jwtService.sign(payload, {
			secret: process.env.JWT_REFRESH_SECRET,
			expiresIn: '7d',
		})

		await this.prisma.user.update({
			where: {id: user.id},
			data: {	refresh_token: refresh_token}
		})
		return {
			access_token: access_token,
			refresh_token: refresh_token,
		}
	}

	async refresh(refresh_token: string) {
		try {
			const payload = this.jwtService.verify(refresh_token, {
				secret: process.env.JWT_REFRESH_SECRET,
			})
			const userId = payload.sub
			const user = await this.prisma.user.findUnique({
				where: {id: userId}
			})
			if (!user)
				throw new UnauthorizedException("User not found.")
			if (user && user.refresh_token != refresh_token)
				throw new UnauthorizedException("Invalid refresh token.")
			const new_generate = {email: user.email, sub: user.id, role: user.role}
			const new_access_token = this.jwtService.sign(new_generate, {expiresIn: '15m'})
			return { access_token: new_access_token }
		} catch (err: any) {
			throw new UnauthorizedException("Refresh token expired or invalid.")
		}
	}

	async logout(userId: number) {
		await this.prisma.user.update({
			where: {id: userId},
			data: {refresh_token: null}
		})
		return { ok: true }
	}

	async validateUser(email: string, password: string) {
		const user = await this.prisma.user.findUnique({
			where: {email: email}
		})
		if (user && await bcrypt.compare(password, user.password)) {
			const {password: _, ...res} = user
			return res
		}
		return null
	}
}
