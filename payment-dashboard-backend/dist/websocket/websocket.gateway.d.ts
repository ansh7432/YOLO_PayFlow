import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
export declare class PaymentWebSocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private jwtService;
    server: Server;
    private readonly logger;
    private connectedClients;
    constructor(jwtService: JwtService);
    handleConnection(client: Socket): Promise<void>;
    handleDisconnect(client: Socket): void;
    emitPaymentCreated(payment: any): void;
    emitPaymentUpdated(payment: any): void;
    emitPaymentDeleted(paymentId: string, userId: string): void;
    emitStatsUpdated(): void;
    handlePing(client: Socket): void;
    handleJoinRoom(data: {
        room: string;
    }, client: Socket): void;
}
