"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const payment_schema_1 = require("./schemas/payment.schema");
const websocket_gateway_1 = require("../websocket/websocket.gateway");
let PaymentsService = class PaymentsService {
    constructor(paymentModel, websocketGateway) {
        this.paymentModel = paymentModel;
        this.websocketGateway = websocketGateway;
    }
    async create(createPaymentDto, userId) {
        const transactionId = this.generateTransactionId();
        const payment = new this.paymentModel({
            ...createPaymentDto,
            transactionId,
            userId,
            currency: createPaymentDto.currency || 'INR',
            fee: createPaymentDto.fee || this.calculateFee(createPaymentDto.amount),
        });
        const savedPayment = await payment.save();
        this.websocketGateway.emitPaymentCreated(savedPayment.toJSON());
        this.websocketGateway.emitStatsUpdated();
        return savedPayment;
    }
    async findAll(page = 1, limit = 10, status, method, startDate, endDate, userId, userRole) {
        const query = {};
        if (userRole !== 'admin' && userId) {
            query.userId = userId;
        }
        if (status)
            query.status = status;
        if (method)
            query.method = method;
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate)
                query.createdAt.$gte = new Date(startDate);
            if (endDate)
                query.createdAt.$lte = new Date(endDate);
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
    async findOne(id) {
        return this.paymentModel.findById(id).exec();
    }
    async getStats(userId, userRole) {
        const today = new Date();
        const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const startOfWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        const baseQuery = {};
        if (userRole !== 'admin' && userId) {
            baseQuery.userId = userId;
        }
        const [totalPaymentsToday, totalPaymentsWeek, totalRevenueToday, totalRevenueWeek, failedTransactions, recentPayments, paymentsByStatus, revenueByDay,] = await Promise.all([
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
    async exportToCsv(status, method, startDate, endDate, userId, userRole, res) {
        const query = {};
        if (userRole !== 'admin' && userId) {
            query.userId = userId;
        }
        if (status)
            query.status = status;
        if (method)
            query.method = method;
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate)
                query.createdAt.$gte = new Date(startDate);
            if (endDate)
                query.createdAt.$lte = new Date(endDate);
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
    generateCsv(payments) {
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
            payment.createdAt?.toISOString().split('T')[0] || '',
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
    generateTransactionId() {
        return 'TXN' + Date.now() + Math.random().toString(36).substr(2, 9);
    }
    calculateFee(amount) {
        return Math.round(amount * 0.029 * 100) / 100;
    }
    async seedSampleData(adminUserId) {
        const count = await this.paymentModel.countDocuments();
        if (count > 0)
            return;
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
            await this.create(payment, adminUserId);
        }
        console.log('Sample payment data seeded');
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(payment_schema_1.Payment.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        websocket_gateway_1.PaymentWebSocketGateway])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map