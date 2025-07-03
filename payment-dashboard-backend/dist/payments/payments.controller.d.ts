import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { Response, Request } from 'express';
export declare class PaymentsController {
    private readonly paymentsService;
    constructor(paymentsService: PaymentsService);
    create(createPaymentDto: CreatePaymentDto, req: Request): Promise<import("./schemas/payment.schema").Payment>;
    findAll(page?: string, limit?: string, status?: string, method?: string, startDate?: string, endDate?: string, req?: Request): Promise<{
        payments: import("./schemas/payment.schema").Payment[];
        total: number;
        totalPages: number;
    }>;
    getStats(req: Request): Promise<any>;
    exportToCsv(status?: string, method?: string, startDate?: string, endDate?: string, res?: Response, req?: Request): Promise<void>;
    findOne(id: string): Promise<import("./schemas/payment.schema").Payment>;
}
