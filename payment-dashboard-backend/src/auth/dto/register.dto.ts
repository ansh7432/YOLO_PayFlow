import { IsString, IsEmail, IsOptional, IsEnum } from 'class-validator';

export class RegisterDto {
  @IsString()
  username: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsOptional()
  @IsEnum(['admin', 'user'])
  role?: 'admin' | 'user' = 'user';
}
