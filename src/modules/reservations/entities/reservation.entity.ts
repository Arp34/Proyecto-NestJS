import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Customer } from '../../customers/entities/customer.entity.js';
import { Table } from '../../tables/entities/table.entity.js';

@Entity('reservations')
export class Reservation {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  customer_id!: string;

  @ManyToOne(() => Customer, { nullable: false })
  @JoinColumn({ name: 'customer_id' })
  customer!: Customer;

  @Column({ type: 'uuid', nullable: true })
  table_id?: string;

  @ManyToOne(() => Table, { nullable: true })
  @JoinColumn({ name: 'table_id' })
  table?: Table;

  @Column({ type: 'date' })
  date!: string;

  @Column({ type: 'time' })
  time!: string;

  @Column({ type: 'int' })
  guests!: number;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'PENDING',
  })
  status!: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  notes?: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at!: Date;
}