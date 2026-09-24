import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
<<<<<<< HEAD

import { Table } from './modules/tables/entities/table.entity.js';
import { ReservationsModule } from './modules/reservations/reservations.module.js';
import { Reservation } from './modules/reservations/entities/reservation.entity.js';
import { CategoriesModule } from './modules/categories/categories.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
=======
import { CustomersModule } from './modules/customers/customers.module.js';
import { CategoriesModule } from './modules/categories/categories.module.js';
import { TablesModule } from './modules/tables/tables.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
>>>>>>> origin/feature/customers

    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgrespassword',
      database: process.env.DB_DATABASE || 'restaurant_db',
<<<<<<< HEAD

      entities: [Table, Reservation],
      autoLoadEntities: true,
      synchronize: true,
    }),

    ReservationsModule,
    CategoriesModule,
=======
      autoLoadEntities: true,
      synchronize: true, // Sincroniza automáticamente las entidades en PostgreSQL (solo en desarrollo)
    }),
    CategoriesModule,
    CustomersModule,
    TablesModule,
>>>>>>> origin/feature/customers
  ],
})
export class AppModule {}
