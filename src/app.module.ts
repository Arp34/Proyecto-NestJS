import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomersModule } from './modules/customers/customers.module.js';
import { CategoriesModule } from './modules/categories/categories.module.js';
import { TablesModule } from './modules/tables/tables.module.js';
import { ProductModule } from './modules/product/product.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgrespassword',
      database: process.env.DB_DATABASE || 'restaurant_db',
      autoLoadEntities: true,
      synchronize: true, // Sincroniza automáticamente las entidades en PostgreSQL (solo en desarrollo)
    }),
    CategoriesModule,
    ProductModule,
    CustomersModule,
    TablesModule,
  ],
})
export class AppModule {}
