import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import { User, UserDocument } from '../users/schemas/user.schema';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
export declare class AuthService {
    private userModel;
    private jwtService;
    constructor(userModel: Model<UserDocument>, jwtService: JwtService);
    validateUser(username: string, password: string): Promise<any>;
    login(loginDto: LoginDto): Promise<{
        access_token: string;
        user: {
            id: any;
            username: any;
            email: any;
            role: any;
        };
    }>;
    register(registerDto: RegisterDto): Promise<{
        access_token: string;
        user: {
            id: any;
            username: string;
            email: string;
            role: string;
        };
    }>;
    hashPassword(password: string): Promise<string>;
    createDefaultUser(): Promise<import("mongoose").Document<unknown, {}, UserDocument> & User & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }>;
}
