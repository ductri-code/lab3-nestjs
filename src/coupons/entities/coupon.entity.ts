import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export enum DiscountType {
  PERCENT = 'PERCENT',
  FIXED = 'FIXED'
}

@Entity('coupons')
export class Coupon {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 50 })
  code: string;

  @Column({
    type: 'enum',
    enum: DiscountType
  })
  discountType: DiscountType;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  discountValue: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  minOrderValue: number;

  @Column({ type: 'int', default: 0 })
  usageLimit: number;

  @Column({ type: 'int', default: 0 })
  usedCount: number;

  @Column({ type: 'datetime' })
  startAt: Date;

  @Column({ type: 'datetime' })
  endAt: Date;

  @Column({ default: true })
  isActive: boolean;

  // Thêm cột này để hỗ trợ Challenge 2 (Coupon theo Category)
  @Column({ nullable: true })
  categoryId: number;
}