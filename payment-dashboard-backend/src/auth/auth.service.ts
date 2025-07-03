import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from '../users/schemas/user.schema';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    // Allow login with either username or email
    const user = await this.userModel.findOne({
      $or: [
        { username },
        { email: username }
      ]
    }).exec();
    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user.toObject();
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.username, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    
    const payload = { username: user.username, sub: user._id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    };
  }

  async register(registerDto: RegisterDto) {
    // Check if user already exists
    const existingUser = await this.userModel.findOne({
      $or: [
        { username: registerDto.username },
        { email: registerDto.email }
      ]
    }).exec();

    if (existingUser) {
      throw new ConflictException('Username or email already exists');
    }

    // Hash password
    const hashedPassword = await this.hashPassword(registerDto.password);

    // Create new user
    const newUser = new this.userModel({
      username: registerDto.username,
      email: registerDto.email,
      password: hashedPassword,
      role: registerDto.role || 'user',
    });

    const savedUser = await newUser.save();

    // Return login response (automatically log in the user)
    const payload = { username: savedUser.username, sub: savedUser._id, role: savedUser.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: savedUser._id,
        username: savedUser.username,
        email: savedUser.email,
        role: savedUser.role,
      },
    };
  }

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  async createDefaultUser() {
    let adminUser = await this.userModel.findOne({ username: 'admin' }).exec();
    if (!adminUser) {
      const hashedPassword = await this.hashPassword('admin123');
      const defaultUser = new this.userModel({
        username: 'admin',
        email: 'admin@paymentdashboard.com',
        password: hashedPassword,
        role: 'admin',
      });
      adminUser = await defaultUser.save();
      console.log('Default admin user created: admin/admin123');
    }
    return adminUser;
  }
}
