import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Payment, PaymentDocument } from './schemas/payment.schema';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { Response } from 'express';
import { PaymentWebSocketGateway } from '../websocket/websocket.gateway';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    private websocketGateway: PaymentWebSocketGateway,
  ) {}

  async create(createPaymentDto: CreatePaymentDto, userId: string): Promise<Payment> {
    const transactionId = this.generateTransactionId();
    const payment = new this.paymentModel({
      ...createPaymentDto,
      transactionId,
      userId,
      currency: createPaymentDto.currency || 'INR',
      fee: createPaymentDto.fee || this.calculateFee(createPaymentDto.amount),
    });
    
    const savedPayment = await payment.save();
    
    // Emit WebSocket event for real-time updates
    this.websocketGateway.emitPaymentCreated(savedPayment.toJSON());
    this.websocketGateway.emitStatsUpdated();
    
    return savedPayment;
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    status?: string,
    method?: string,
    startDate?: string,
    endDate?: string,
    userId?: string,
    userRole?: string,
  ): Promise<{ payments: Payment[]; total: number; totalPages: number }> {
    const query: any = {};
    
    // If user is not admin, only show their own transactions
    if (userRole !== 'admin' && userId) {
      query.userId = userId;
    }
    
    if (status) query.status = status;
    if (method) query.method = method;
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const total = await this.paymentModel.countDocuments(query);
    const payments = await this.paymentModel
      .find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    return {
      payments,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Payment> {
    return this.paymentModel.findById(id).exec();
  }

  async getStats(userId?: string, userRole?: string): Promise<any> {
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Base query - filter by user if not admin
    const baseQuery: any = {};
    if (userRole !== 'admin' && userId) {
      baseQuery.userId = userId;
    }

    const [
      totalPaymentsToday,
      totalPaymentsWeek,
      totalRevenueToday,
      totalRevenueWeek,
      failedTransactions,
      recentPayments,
      paymentsByStatus,
      revenueByDay,
    ] = await Promise.all([
      this.paymentModel.countDocuments({ 
        ...baseQuery, 
        createdAt: { $gte: startOfToday } 
      }),
      this.paymentModel.countDocuments({ 
        ...baseQuery, 
        createdAt: { $gte: startOfWeek } 
      }),
      this.paymentModel.aggregate([
        { $match: { ...baseQuery, createdAt: { $gte: startOfToday }, status: 'success' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      this.paymentModel.aggregate([
        { $match: { ...baseQuery, createdAt: { $gte: startOfWeek }, status: 'success' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      this.paymentModel.countDocuments({ ...baseQuery, status: 'failed' }),
      this.paymentModel.find(baseQuery).sort({ createdAt: -1 }).limit(5),
      this.paymentModel.aggregate([
        { $match: baseQuery },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      this.paymentModel.aggregate([
        {
          $match: {
            ...baseQuery,
            createdAt: { $gte: startOfWeek },
            status: 'success',
          },
        },
        {
          $group: {
            _id: {
              day: { $dayOfMonth: '$createdAt' },
              month: { $month: '$createdAt' },
              year: { $year: '$createdAt' },
            },
            revenue: { $sum: '$amount' },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
      ]),
    ]);

    return {
      totalPaymentsToday,
      totalPaymentsWeek,
      totalRevenueToday: totalRevenueToday[0]?.total || 0,
      totalRevenueWeek: totalRevenueWeek[0]?.total || 0,
      failedTransactions,
      recentPayments,
      paymentsByStatus,
      revenueByDay,
    };
  }

  async exportToCsv(
    status?: string,
    method?: string,
    startDate?: string,
    endDate?: string,
    userId?: string,
    userRole?: string,
    res?: Response,
  ): Promise<void> {
    const query: any = {};
    
    // If user is not admin, only export their own transactions
    if (userRole !== 'admin' && userId) {
      query.userId = userId;
    }
    
    if (status) query.status = status;
    if (method) query.method = method;
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const payments = await this.paymentModel
      .find(query)
      .sort({ createdAt: -1 })
      .exec();

    const csv = this.generateCsv(payments);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=transactions.csv');
    res.send(csv);
  }

  private generateCsv(payments: PaymentDocument[]): string {
    const headers = [
      'Transaction ID',
      'Date',
      'Amount',
      'Currency',
      'Receiver',
      'Status',
      'Method',
      'Description',
      'Fee'
    ];
    
    const rows = payments.map(payment => [
      payment.transactionId,
      (payment as any).createdAt?.toISOString().split('T')[0] || '',
      payment.amount.toString(),
      payment.currency,
      payment.receiver,
      payment.status,
      payment.method,
      payment.description || '',
      payment.fee?.toString() || '0'
    ]);
    
    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
    
    return csvContent;
  }

  private generateTransactionId(): string {
    return 'TXN' + Date.now() + Math.random().toString(36).substr(2, 9);
  }

  private calculateFee(amount: number): number {
    return Math.round(amount * 0.029 * 100) / 100; // 2.9% fee
  }

  async seedSampleData(adminUserId: string): Promise<void> {
    const count = await this.paymentModel.countDocuments();
    if (count > 0) return;

    const samplePayments = [
      {
        amount: 150.00,
        receiver: 'John Doe',
        status: 'success',
        method: 'credit_card',
        description: 'Product purchase',
        currency: 'INR',
      },
      {
        amount: 75.50,
        receiver: 'Jane Smith',
        status: 'success',
        method: 'paypal',
        description: 'Service payment',
        currency: 'INR',
      },
      {
        amount: 200.00,
        receiver: 'Mike Johnson',
        status: 'failed',
        method: 'debit_card',
        description: 'Order #12345',
        currency: 'INR',
      },
      {
        amount: 99.99,
        receiver: 'Sarah Wilson',
        status: 'pending',
        method: 'bank_transfer',
        description: 'Subscription fee',
        currency: 'INR',
      },
      {
        amount: 1000.00,
        receiver: 'Corporate Client',
        status: 'success',
        method: 'crypto',
        description: 'Large order payment',
        currency: 'INR',
      },
    ];

    for (const payment of samplePayments) {
      await this.create(payment as CreatePaymentDto, adminUserId);
    }

    console.log('Sample payment data seeded');
  }
}
