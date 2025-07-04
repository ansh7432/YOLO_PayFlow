"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const bcrypt = require("bcrypt");
const user_schema_1 = require("../users/schemas/user.schema");
let AuthService = class AuthService {
    constructor(userModel, jwtService) {
        this.userModel = userModel;
        this.jwtService = jwtService;
    }
    async validateUser(username, password) {
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
    async login(loginDto) {
        const user = await this.validateUser(loginDto.username, loginDto.password);
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
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
    async register(registerDto) {
        const existingUser = await this.userModel.findOne({
            $or: [
                { username: registerDto.username },
                { email: registerDto.email }
            ]
        }).exec();
        if (existingUser) {
            throw new common_1.ConflictException('Username or email already exists');
        }
        const hashedPassword = await this.hashPassword(registerDto.password);
        const newUser = new this.userModel({
            username: registerDto.username,
            email: registerDto.email,
            password: hashedPassword,
            role: registerDto.role || 'user',
        });
        const savedUser = await newUser.save();
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
    async hashPassword(password) {
        const saltRounds = 10;
        return bcrypt.hash(password, saltRounds);
    }
    async createDefaultUser() {
        let adminUser = await this.userModel.findOne({ username: 'admin' }).exec();
        if (!adminUser) {
            const hashedPassword = await this.hashPassword('123456');
            const defaultUser = new this.userModel({
                username: 'admin',
                email: 'admin@paymentdashboard.com',
                password: hashedPassword,
                role: 'admin',
            });
            adminUser = await defaultUser.save();
            console.log('Default admin user created: admin/123456');
        }
        return adminUser;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map