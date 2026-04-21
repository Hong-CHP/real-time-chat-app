import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { ChatGateway } from "./chat.gateway";
import { PrismaModule } from "src/prisma/prisma.module";
import { ChatService } from "./chat.service";
import { ChatController } from "./chat.controller";
import { AuthModule } from "src/auth/auth.module";

@Module({
	imports: [
		AuthModule,
		PrismaModule
	],
	controllers: [ChatController],
	providers: [ChatGateway, ChatService],
	exports: [ChatGateway]
})
export class ChatModule{}