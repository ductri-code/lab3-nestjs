import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('order_status_histories')
export class OrderStatusHistory {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  orderId: number;

  @Column({ length: 30 })
  fromStatus: string;

  @Column({ length: 30 })
  toStatus: string;

  @Column({ type: 'text', nullable: true })
  note: string;

  @CreateDateColumn()
  createdAt: Date;
}