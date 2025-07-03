import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
export class PaymentWebSocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(PaymentWebSocketGateway.name);
  private connectedClients = new Map<string, { socket: Socket; userId: string; userRole: string }>();

  constructor(private jwtService: JwtService) {}

  async handleConnection(client: Socket) {
    try {
      // Extract token from handshake
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

      // Verify JWT token
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production'
      });
      const userId = payload.sub;
      const userRole = payload.role;

      // Store client info
      this.connectedClients.set(client.id, {
        socket: client,
        userId,
        userRole,
      });

      // Join user to their own room for personalized updates
      client.join(`user:${userId}`);
      
      // Join admins to admin room for all updates
      if (userRole === 'admin') {
        client.join('admin');
      }

      this.logger.log(`Client ${client.id} connected successfully as ${userRole} (userId: ${userId})`);
      
      // Send welcome message
      client.emit('connected', {
        message: 'Connected to PayFlow real-time updates',
        userId,
        userRole,
      });

    } catch (error) {
      this.logger.error(`Authentication failed for client ${client.id}: ${error.message}`);
      client.emit('error', { message: 'Authentication failed' });
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const clientInfo = this.connectedClients.get(client.id);
    if (clientInfo) {
      this.logger.log(`Client ${client.id} disconnected (userId: ${clientInfo.userId})`);
      this.connectedClients.delete(client.id);
    }
  }

  // Emit payment created event
  emitPaymentCreated(payment: any) {
    // Notify the user who created the payment
    this.server.to(`user:${payment.userId}`).emit('paymentCreated', payment);
    
    // Notify all admins
    this.server.to('admin').emit('paymentCreated', payment);
    
    this.logger.log(`Payment created event emitted for payment ${payment._id}`);
  }

  // Emit payment updated event
  emitPaymentUpdated(payment: any) {
    // Notify the user who owns the payment
    this.server.to(`user:${payment.userId}`).emit('paymentUpdated', payment);
    
    // Notify all admins
    this.server.to('admin').emit('paymentUpdated', payment);
    
    this.logger.log(`Payment updated event emitted for payment ${payment._id}`);
  }

  // Emit payment deleted event
  emitPaymentDeleted(paymentId: string, userId: string) {
    // Notify the user who owned the payment
    this.server.to(`user:${userId}`).emit('paymentDeleted', { paymentId });
    
    // Notify all admins
    this.server.to('admin').emit('paymentDeleted', { paymentId });
    
    this.logger.log(`Payment deleted event emitted for payment ${paymentId}`);
  }

  // Emit stats updated event (useful for dashboard)
  emitStatsUpdated() {
    // Notify all connected clients to refresh their stats
    this.server.emit('statsUpdated');
    this.logger.log('Stats updated event emitted to all clients');
  }

  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket): void {
    client.emit('pong', { timestamp: new Date().toISOString() });
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @MessageBody() data: { room: string },
    @ConnectedSocket() client: Socket,
  ): void {
    const clientInfo = this.connectedClients.get(client.id);
    if (!clientInfo) return;

    // Only allow joining specific rooms based on user role
    if (data.room === 'admin' && clientInfo.userRole !== 'admin') {
      client.emit('error', { message: 'Access denied to admin room' });
      return;
    }

    client.join(data.room);
    client.emit('joinedRoom', { room: data.room });
  }
}
