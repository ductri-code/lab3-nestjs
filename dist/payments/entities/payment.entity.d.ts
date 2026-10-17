import { Order } from '../../orders/entities/order.entity';
export declare enum PaymentMethod {
    COD = "COD",
    BANKING = "BANKING",
    CARD = "CARD"
}
export declare enum PaymentStatus {
    PENDING = "PENDING",
    PAID = "PAID",
    FAILED = "FAILED",
    REFUNDED = "REFUNDED"
}
export declare class Payment {
    id: number;
    order: Order;
    orderId: number;
    method: PaymentMethod;
    status: PaymentStatus;
    amount: number;
    transactionCode: string;
    createdAt: Date;
}
