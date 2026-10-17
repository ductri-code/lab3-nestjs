import { Controller, Get, Post, Body, Param, Patch, Headers, Query } from '@nestjs/common';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(
    @Body() createOrderDto: any,
    @Headers('idempotency-key') idempotencyKey: string,
  ) {
    return this.ordersService.createOrder(createOrderDto, idempotencyKey);
  }

  @Get()
  findAll() {
    return this.ordersService.findAll();
  }

  // Thêm endpoint thống kê doanh thu (Challenge 5)
  @Get('statistics/revenue')
  getRevenueStatistics(
    @Query('from') fromDate: string,
    @Query('to') toDate: string,
  ) {
    return this.ordersService.getRevenueStatistics(fromDate, toDate);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(+id);
  }

  @Get(':id/history')
  getHistory(@Param('id') id: string) {
    return this.ordersService.getHistory(+id);
  }

  @Post(':id/payments')
  createPayment(@Param('id') id: string, @Body() body: { method: string }) {
    return this.ordersService.createPayment(+id, body.method);
  }

  @Patch(':id/cancel')
  cancelOrder(@Param('id') id: string) {
    return this.ordersService.cancelOrder(+id);
  }

  // Thêm endpoint hoàn tiền và hoàn kho (Challenge 4)
  @Patch(':id/refund')
  refundOrder(@Param('id') id: string) {
    return this.ordersService.refundOrder(+id);
  }
}