import { Body, Controller, Post, Get, Req, Res } from '@nestjs/common';
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
	async login(@Res({ passthrough: true}) res, @Body() body) {
		const user = await this.authService.validateUser(body.email, body.password);
		if (!user)
			throw new UnauthorizedException('Invalide credentials')
		const {access_token, refresh_token} = await this.authService.login(user)
		res.cookie('refresh_token', refresh_token, {
			httpOnly: true,  //js cannot read
			secure: false, //prod change to true, only https
			sameSite: 'strict', //anti csrf
			maxAge: 7 * 24 * 60 * 60 * 1000,
		})
		return { access_token }
	}

	@Post('refresh')
	async refresh(@Req() req) {
		const refreshToken = req.cookie?.refresh_token
		if (!refreshToken)
			throw new UnauthorizedException("Invalid credentials")

		return this.authService.refresh(refreshToken)
	}

	@UseGuards(AuthGuard('jwt'))
	@Post('logout')
	async logout(@Req() req, @Res({passthrough : true}) res) {
		res.clearCookie('refresh_token')
		return this.authService.logout(req.user.id)
	}

	@UseGuards(AuthGuard('jwt'))
	@Get('profile')
	getProfile(@Req() req) {
		return req.user
	}
}