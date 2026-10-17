import { Repository, DataSource } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderStatusHistory } from './entities/order-status-history.entity';
import { IdempotencyKey } from './entities/idempotency-key.entity';
import { Payment } from '../payments/entities/payment.entity';
export declare class OrdersService {
    private dataSource;
    private orderRepo;
    private idempotencyRepo;
    private historyRepo;
    constructor(dataSource: DataSource, orderRepo: Repository<Order>, idempotencyRepo: Repository<IdempotencyKey>, historyRepo: Repository<OrderStatusHistory>);
    createOrder(createOrderDto: any, idempotencyKey: string): Promise<Order | null>;
    findAll(): Promise<Order[]>;
    findOne(id: number): Promise<Order>;
    getHistory(orderId: number): Promise<OrderStatusHistory[]>;
    createPayment(orderId: number, method: string): Promise<Payment>;
    cancelOrder(orderId: number): Promise<{
        message: string;
        order: Order;
    }>;
    refundOrder(orderId: number): Promise<{
        message: string;
        order: Order;
    }>;
    getRevenueStatistics(fromDate: string, toDate: string): Promise<{
        fromDate: string;
        toDate: string;
        totalOrders: number;
        paidOrdersCount: number;
        totalRevenue: number;
        totalDiscountGiven: number;
    }>;
}
