import { OrdersService } from './orders.service';
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    create(createOrderDto: any, idempotencyKey: string): Promise<import("./entities/order.entity").Order | null>;
    findAll(): Promise<import("./entities/order.entity").Order[]>;
    getRevenueStatistics(fromDate: string, toDate: string): Promise<{
        fromDate: string;
        toDate: string;
        totalOrders: number;
        paidOrdersCount: number;
        totalRevenue: number;
        totalDiscountGiven: number;
    }>;
    findOne(id: string): Promise<import("./entities/order.entity").Order>;
    getHistory(id: string): Promise<import("./entities/order-status-history.entity").OrderStatusHistory[]>;
    createPayment(id: string, body: {
        method: string;
    }): Promise<import("../payments/entities/payment.entity").Payment>;
    cancelOrder(id: string): Promise<{
        message: string;
        order: import("./entities/order.entity").Order;
    }>;
    refundOrder(id: string): Promise<{
        message: string;
        order: import("./entities/order.entity").Order;
    }>;
}
