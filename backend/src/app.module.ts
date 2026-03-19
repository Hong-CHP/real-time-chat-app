import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config'
import { AuthController } from './auth/auth.controller';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    UsersModule, 
    PrismaModule, 
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true,
  }), AuthModule],
  controllers: [AppController, AuthController],
  providers: [AppService],
})
export class AppModule {}
