import { IsString, IsEnum, IsNumber, IsBoolean, IsDateString, IsOptional } from 'class-validator';
import { DiscountType } from '../entities/coupon.entity';

export class CreateCouponDto {
  @IsString()
  code: string;

  @IsEnum(DiscountType)
  discountType: DiscountType;

  @IsNumber()
  discountValue: number;

  @IsNumber()
  @IsOptional()
  minOrderValue?: number;

  @IsNumber()
  @IsOptional()
  usageLimit?: number;

  @IsDateString()
  startAt: string;

  @IsDateString()
  endAt: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}