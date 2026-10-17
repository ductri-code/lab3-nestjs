import { UserRole } from '../enums/user-role.enum';
export declare class User {
    id: number;
    email: string;
    password: string;
    fullName: string;
    role: UserRole;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
