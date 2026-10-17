import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]), // Cấp quyền truy cập bảng User cho Auth
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'super-secret-key', // Nên đưa vào file .env sau
      signOptions: { expiresIn: '1d' }, // Token có hạn 1 ngày
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService], // Cho phép module khác tái sử dụng AuthService
})
export class AuthModule {}