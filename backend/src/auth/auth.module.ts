import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from 'src/users/users.module';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [UsersModule, 
    JwtModule.register(
      {
        secret: 'your-secret-key',
        signOptions: {expiresIn: '1h'}
      }
    )
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController], 
  exports: [AuthService]
})
export class AuthModule {}
