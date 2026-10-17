import { DiscountType } from '../entities/coupon.entity';
export declare class CreateCouponDto {
    code: string;
    discountType: DiscountType;
    discountValue: number;
    minOrderValue?: number;
    usageLimit?: number;
    startAt: string;
    endAt: string;
    isActive?: boolean;
}
