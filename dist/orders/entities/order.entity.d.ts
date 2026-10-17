import { OrderItem } from './order-item.entity';
export declare enum OrderStatus {
    PENDING = "PENDING",
    CONFIRMED = "CONFIRMED",
    SHIPPED = "SHIPPED",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED"
}
export declare class Order {
    id: number;
    customerName: string;
    customerPhone: string;
    shippingAddress: string;
    couponCode: string;
    status: OrderStatus;
    subtotal: number;
    discountAmount: number;
    shippingFee: number;
    grandTotal: number;
    items: OrderItem[];
    createdAt: Date;
}
