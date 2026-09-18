import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum productAvailability {
    PENDING = 'PENDING',
    COOKING = 'COOKING',
    COMPLETED = 'COMPLETED',
    SERVER = 'SERVER',
    CANCELLED = 'CANCELLED'
}

@Entity('product')
export class Product {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar' })
    name: string;

    @Column({ type: 'varchar' })
    description: string;

    @Column({ type: 'int' })
    price: number;

    @Column({})
    category_id: string;

    @Column({
        type: 'enum',
        enum: productAvailability,
        default: productAvailability.PENDING
    })
    availability: string;

    @Column({ type: 'varchar' })
    imageUrl: string;

    @CreateDateColumn()
    createdAt: Date;
    
    @UpdateDateColumn()
    updatedAt: Date;
}
