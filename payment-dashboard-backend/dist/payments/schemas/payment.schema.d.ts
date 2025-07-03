import { Document, Types } from 'mongoose';
export type PaymentDocument = Payment & Document;
export declare class Payment {
    amount: number;
    receiver: string;
    status: string;
    method: string;
    description?: string;
    transactionId: string;
    currency: string;
    fee: number;
    userId: Types.ObjectId;
}
export declare const PaymentSchema: import("mongoose").Schema<Payment, import("mongoose").Model<Payment, any, any, any, Document<unknown, any, Payment> & Payment & {
    _id: Types.ObjectId;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Payment, Document<unknown, {}, import("mongoose").FlatRecord<Payment>> & import("mongoose").FlatRecord<Payment> & {
    _id: Types.ObjectId;
}>;
