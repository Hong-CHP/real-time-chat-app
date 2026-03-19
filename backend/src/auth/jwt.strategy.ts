import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(){
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			secretOrKey: 'your-secret-key'
		})
	}

	async validate(payload: any) {
		return {email: payload.email, id: payload.sub}
	}
}