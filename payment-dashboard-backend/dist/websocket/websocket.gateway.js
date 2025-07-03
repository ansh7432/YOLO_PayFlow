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
var PaymentWebSocketGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentWebSocketGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
let PaymentWebSocketGateway = PaymentWebSocketGateway_1 = class PaymentWebSocketGateway {
    constructor(jwtService) {
        this.jwtService = jwtService;
        this.logger = new common_1.Logger(PaymentWebSocketGateway_1.name);
        this.connectedClients = new Map();
    }
    async handleConnection(client) {
        try {
            const token = client.handshake.auth?.token ||
                client.handshake.headers?.authorization?.replace('Bearer ', '') ||
                client.handshake.query?.token;
            this.logger.log(`Client ${client.id} attempting connection with token: ${token ? 'present' : 'missing'}`);
            if (!token) {
                this.logger.warn(`Client ${client.id} connected without token`);
                client.emit('error', { message: 'Authentication token required' });
                client.disconnect();
                return;
            }
            const payload = this.jwtService.verify(token, {
                secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production'
            });
            const userId = payload.sub;
            const userRole = payload.role;
            this.connectedClients.set(client.id, {
                socket: client,
                userId,
                userRole,
            });
            client.join(`user:${userId}`);
            if (userRole === 'admin') {
                client.join('admin');
            }
            this.logger.log(`Client ${client.id} connected successfully as ${userRole} (userId: ${userId})`);
            client.emit('connected', {
                message: 'Connected to PayFlow real-time updates',
                userId,
                userRole,
            });
        }
        catch (error) {
            this.logger.error(`Authentication failed for client ${client.id}: ${error.message}`);
            client.emit('error', { message: 'Authentication failed' });
            client.disconnect();
        }
    }
    handleDisconnect(client) {
        const clientInfo = this.connectedClients.get(client.id);
        if (clientInfo) {
            this.logger.log(`Client ${client.id} disconnected (userId: ${clientInfo.userId})`);
            this.connectedClients.delete(client.id);
        }
    }
    emitPaymentCreated(payment) {
        this.server.to(`user:${payment.userId}`).emit('paymentCreated', payment);
        this.server.to('admin').emit('paymentCreated', payment);
        this.logger.log(`Payment created event emitted for payment ${payment._id}`);
    }
    emitPaymentUpdated(payment) {
        this.server.to(`user:${payment.userId}`).emit('paymentUpdated', payment);
        this.server.to('admin').emit('paymentUpdated', payment);
        this.logger.log(`Payment updated event emitted for payment ${payment._id}`);
    }
    emitPaymentDeleted(paymentId, userId) {
        this.server.to(`user:${userId}`).emit('paymentDeleted', { paymentId });
        this.server.to('admin').emit('paymentDeleted', { paymentId });
        this.logger.log(`Payment deleted event emitted for payment ${paymentId}`);
    }
    emitStatsUpdated() {
        this.server.emit('statsUpdated');
        this.logger.log('Stats updated event emitted to all clients');
    }
    handlePing(client) {
        client.emit('pong', { timestamp: new Date().toISOString() });
    }
    handleJoinRoom(data, client) {
        const clientInfo = this.connectedClients.get(client.id);
        if (!clientInfo)
            return;
        if (data.room === 'admin' && clientInfo.userRole !== 'admin') {
            client.emit('error', { message: 'Access denied to admin room' });
            return;
        }
        client.join(data.room);
        client.emit('joinedRoom', { room: data.room });
    }
};
exports.PaymentWebSocketGateway = PaymentWebSocketGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], PaymentWebSocketGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('ping'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], PaymentWebSocketGateway.prototype, "handlePing", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('joinRoom'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], PaymentWebSocketGateway.prototype, "handleJoinRoom", null);
exports.PaymentWebSocketGateway = PaymentWebSocketGateway = PaymentWebSocketGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
            methods: ['GET', 'POST'],
            credentials: true,
        },
    }),
    __metadata("design:paramtypes", [jwt_1.JwtService])
], PaymentWebSocketGateway);
//# sourceMappingURL=websocket.gateway.js.map