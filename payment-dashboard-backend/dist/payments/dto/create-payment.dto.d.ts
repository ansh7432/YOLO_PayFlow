export declare class CreatePaymentDto {
    amount: number;
    receiver: string;
    status: string;
    method: string;
    description?: string;
    currency?: string;
    fee?: number;
}
