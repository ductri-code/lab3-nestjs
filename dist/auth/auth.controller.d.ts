import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(registerDto: RegisterDto): Promise<{
        id: number;
        email: string;
        fullName: string;
        role: import("../users/enums/user-role.enum").UserRole;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    login(loginDto: LoginDto): Promise<{
        accessToken: string;
        user: {
            id: number;
            email: string;
            fullName: string;
            role: import("../users/enums/user-role.enum").UserRole;
        };
    }>;
}
