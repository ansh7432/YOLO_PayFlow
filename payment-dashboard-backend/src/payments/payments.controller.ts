import { Controller, Get, Post, Body, Param, Query, UseGuards, Res, Req } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Response, Request } from 'express';

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  create(@Body() createPaymentDto: CreatePaymentDto, @Req() req: Request) {
    const user = (req as any).user;
    return this.paymentsService.create(createPaymentDto, user.userId);
  }

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('method') method?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Req() req?: Request,
  ) {
    const user = (req as any).user;
    return this.paymentsService.findAll(
      parseInt(page) || 1,
      parseInt(limit) || 10,
      status,
      method,
      startDate,
      endDate,
      user.userId,
      user.role,
    );
  }

  @Get('stats')
  getStats(@Req() req: Request) {
    const user = (req as any).user;
    return this.paymentsService.getStats(user.userId, user.role);
  }

  @Get('export/csv')
  async exportToCsv(
    @Query('status') status?: string,
    @Query('method') method?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Res() res?: Response,
    @Req() req?: Request,
  ) {
    const user = (req as any).user;
    return this.paymentsService.exportToCsv(status, method, startDate, endDate, user.userId, user.role, res);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.paymentsService.findOne(id);
  }
}
