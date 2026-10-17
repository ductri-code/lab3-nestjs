import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  DeleteDateColumn
} from 'typeorm';
import { Category } from '../../categories/entities/category.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'int' })
  price: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'int', default: 0 })
  quantity: number;

  @CreateDateColumn()
  createdAt: Date;

  @Column()
  categoryId: number;

  @ManyToOne(() => Category, category => category.products, {
    onDelete: 'RESTRICT'
  })
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  // Cột này dùng để đánh dấu thời gian xóa mềm
  @DeleteDateColumn()
  deletedAt: Date;
}