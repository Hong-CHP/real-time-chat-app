import { Body, Controller, Post, Get, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UnauthorizedException } from '@nestjs/common';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
	constructor(private authService: AuthService) {};

	@Post('register')
	async register(@Body() createUserDto: CreateUserDto) {
		return this.authService.register(createUserDto)
	}

	@Post('login')
	async login(@Body() body) {
		const user = await this.authService.validateUser(body.email, body.password);
		if (!user)
			throw new UnauthorizedException('Invalide credentials')
		return this.authService.login(user)
	}

	@UseGuards(AuthGuard('jwt'))
	@Get('profile')
	getProfile(@Req() req) {
		return req.user
	}
}
