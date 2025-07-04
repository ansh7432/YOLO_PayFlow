import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { PaymentsModule } from './payments/payments.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.DATABASE_URL || 'mongodb+srv://flowpay:Anshsoni%40123@cluster0.uv1uysn.mongodb.net/payment-dashboard?retryWrites=true&w=majority&appName=Cluster0'),
    AuthModule,
    PaymentsModule,
    UsersModule,
  ],
})
export class AppModule {}
