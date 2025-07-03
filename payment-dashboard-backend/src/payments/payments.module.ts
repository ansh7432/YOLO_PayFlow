import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { Payment, PaymentSchema } from './schemas/payment.schema';
import { WebSocketModule } from '../websocket/websocket.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Payment.name, schema: PaymentSchema }]),
    WebSocketModule,
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
