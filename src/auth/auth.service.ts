import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '../users/enums/user-role.enum';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, fullName } = registerDto;

    // Kiểm tra xem email đã tồn tại trong database chưa
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new BadRequestException('Email đã được sử dụng trong hệ thống');
    }

    // Mã hóa mật khẩu trước khi lưu
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tạo user mới với role mặc định là CUSTOMER
    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      fullName,
      role: UserRole.CUSTOMER,
    });

    const savedUser = await this.userRepository.save(user);

    // Loại bỏ mật khẩu khỏi kết quả trả về
    const { password: _, ...result } = savedUser;
    return result;
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Lấy user kèm theo trường password (cú pháp select mới của TypeORM)
    const user = await this.userRepository.findOne({
      where: { email },
      select: {
        id: true,
        email: true,
        fullName: true,
        password: true,
        role: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
    }

    // Kiểm tra tính hợp lệ của mật khẩu
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
    }

    // Tạo payload và ký token JWT
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    };
  }
}