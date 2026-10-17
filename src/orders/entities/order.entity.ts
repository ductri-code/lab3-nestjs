import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany
} from 'typeorm';
import { OrderItem } from './order-item.entity';

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  SHIPPED = 'SHIPPED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  customerName: string;

  @Column()
  customerPhone: string;

  @Column()
  shippingAddress: string;

  @Column({ nullable: true })
  couponCode: string; // Lưu mã giảm giá đã dùng (nếu có)

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING
  })
  status: OrderStatus;

  // Tổng tiền sản phẩm trước giảm giá
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  subtotal: number;

  // Số tiền được giảm
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  discountAmount: number;

  // Phí vận chuyển
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  shippingFee: number;

  // Số tiền cuối cùng phải thanh toán
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  grandTotal: number;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order, { cascade: true })
  items: OrderItem[];

  @CreateDateColumn()
  createdAt: Date;
}