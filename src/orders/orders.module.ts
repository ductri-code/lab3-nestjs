import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { OrderStatusHistory } from './entities/order-status-history.entity';
import { IdempotencyKey } from './entities/idempotency-key.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order, 
      OrderItem, 
      OrderStatusHistory, 
      IdempotencyKey
    ])
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}