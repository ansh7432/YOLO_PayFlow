import { IsNumber, IsString, IsEnum, IsOptional, Min } from 'class-validator';

export class CreatePaymentDto {
  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsString()
  receiver: string;

  @IsEnum(['success', 'failed', 'pending'])
  status: string;

  @IsEnum(['credit_card', 'debit_card', 'paypal', 'bank_transfer', 'crypto'])
  method: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsNumber()
  fee?: number;
}
