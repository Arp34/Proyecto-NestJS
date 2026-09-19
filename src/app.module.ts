import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Table } from './modules/tables/entities/table.entity.js';
import { CustomersModule } from './modules/customers/customers.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgrespassword',
      database: process.env.DB_DATABASE || 'restaurant_db',
      entities: [Table],
      synchronize: true, // Sincroniza automáticamente la entidad Table en PostgreSQL
    }),
    CustomersModule,
  ],
})
export class AppModule {}