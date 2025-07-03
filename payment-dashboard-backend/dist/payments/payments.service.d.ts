import { Model } from 'mongoose';
import { Payment, PaymentDocument } from './schemas/payment.schema';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { Response } from 'express';
import { PaymentWebSocketGateway } from '../websocket/websocket.gateway';
export declare class PaymentsService {
    private paymentModel;
    private websocketGateway;
    constructor(paymentModel: Model<PaymentDocument>, websocketGateway: PaymentWebSocketGateway);
    create(createPaymentDto: CreatePaymentDto, userId: string): Promise<Payment>;
    findAll(page?: number, limit?: number, status?: string, method?: string, startDate?: string, endDate?: string, userId?: string, userRole?: string): Promise<{
        payments: Payment[];
        total: number;
        totalPages: number;
    }>;
    findOne(id: string): Promise<Payment>;
    getStats(userId?: string, userRole?: string): Promise<any>;
    exportToCsv(status?: string, method?: string, startDate?: string, endDate?: string, userId?: string, userRole?: string, res?: Response): Promise<void>;
    private generateCsv;
    private generateTransactionId;
    private calculateFee;
    seedSampleData(adminUserId: string): Promise<void>;
}
