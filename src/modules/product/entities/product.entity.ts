import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { productAvailability, productStatus } from '../types/interface.js';
// import { Category } from './category/catory.entity.js';

@Entity('product')
export class Product {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 120 })
    name: string;

    @Column({ type: 'varchar', length: 500 })
    description: string;

    @Column({ type: 'int' })
    price: number;

    @Column({ type: 'varchar', length: 120 })
    category_id: string;

    @Column({
        type: 'enum',
        enum: productAvailability,
        default: productAvailability.AVAILABLE
    })
    availability: string;

    @Column({
        type: 'enum',
        enum: productStatus,
        default: productStatus.ACTIVE
    })
    status: string;

    @Column({ type: 'varchar', length: 500 })
    imageUrl: string;

    @CreateDateColumn()
    createdAt: Date;
    
    @UpdateDateColumn()
    updatedAt: Date;

    // @ManyToOne(() => Category, (category) => category.products)
    // category: Category;
}
