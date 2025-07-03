import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PaymentDocument = Payment & Document;

@Schema({ timestamps: true })
export class Payment {
  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  receiver: string;

  @Prop({ required: true, enum: ['success', 'failed', 'pending'] })
  status: string;

  @Prop({ required: true, enum: ['credit_card', 'debit_card', 'paypal', 'bank_transfer', 'crypto'] })
  method: string;

  @Prop()
  description?: string;

  @Prop()
  transactionId: string;

  @Prop()
  currency: string;

  @Prop()
  fee: number;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
