import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn
} from 'typeorm';
import { Order } from '../../orders/entities/order.entity'; // Đã cập nhật đường dẫn trỏ về thư mục orders

export enum PaymentMethod {
  COD = 'COD',
  BANKING = 'BANKING',
  CARD = 'CARD'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED'
}

@Entity('payments')
export class Payment {

  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Order)
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @Column()
  orderId: number;

  @Column({
    type: 'enum',
    enum: PaymentMethod
  })
  method: PaymentMethod;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING
  })
  status: PaymentStatus;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  transactionCode: string;

  @CreateDateColumn()
  createdAt: Date;
}