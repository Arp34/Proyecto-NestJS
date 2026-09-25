import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  type Relation,
} from 'typeorm';
import { productAvailability, productStatus } from '../types/interface.js';
import { Category } from '../../categories/entities/category.entity.js';

@Entity('product')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 120 })
  name: string;

  @Column({ type: 'varchar', length: 500 })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @ManyToOne(() => Category, (category) => category.products)
  @JoinColumn({ name: 'category_id' })
  category: Relation<Category>;

  @Column({
    type: 'enum',
    enum: productAvailability,
    default: productAvailability.AVAILABLE,
  })
  availability: string;

  @Column({
    type: 'enum',
    enum: productStatus,
    default: productStatus.ACTIVE,
  })
  status: string;

  @Column({ type: 'varchar', length: 500 })
  imageUrl: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
