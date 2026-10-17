export declare class CreateOrderItemDto {
    productId: number;
    quantity: number;
}
export declare class CreateOrderDto {
    customerName: string;
    customerPhone: string;
    shippingAddress: string;
    items: CreateOrderItemDto[];
}
