export declare enum DiscountType {
    PERCENT = "PERCENT",
    FIXED = "FIXED"
}
export declare class Coupon {
    id: number;
    code: string;
    discountType: DiscountType;
    discountValue: number;
    minOrderValue: number;
    usageLimit: number;
    usedCount: number;
    startAt: Date;
    endAt: Date;
    isActive: boolean;
    categoryId: number;
}
