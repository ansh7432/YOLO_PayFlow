import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Request } from 'express';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    create(createUserDto: CreateUserDto): Promise<import("./schemas/user.schema").User>;
    findAll(): Promise<import("./schemas/user.schema").User[]>;
    getProfile(req: Request): Promise<import("./schemas/user.schema").User>;
    findOne(id: string): Promise<import("./schemas/user.schema").User>;
    remove(id: string): Promise<void>;
}
