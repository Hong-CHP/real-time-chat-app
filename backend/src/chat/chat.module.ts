import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { ChatGateway } from "./chat.gateway";

@Module({
	imports: [
		JwtModule.register({
        	secret: 'your-secret-key',
        	signOptions: {expiresIn: '1h'}
    	})],
	providers: [ChatGateway],
})
export class ChatModule{}