import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Table } from './modules/tables/entities/table.entity.js';
import { Reservation } from './modules/reservations/entities/reservation.entity.js';
import { ReservationsModule } from './modules/reservations/reservations.module.js';
import { CategoriesModule } from './modules/categories/categories.module.js';
import { CustomersModule } from './modules/customers/customers.module.js';
import { TablesModule } from './modules/tables/tables.module.js';
import { ProductModule } from './modules/product/product.module.js';


function validateEnv(config: Record<string, unknown>) {
  const required = [
    'DB_HOST',
    'DB_PORT',
    'DB_USERNAME',
    'DB_PASSWORD',
    'DB_DATABASE',
  ];

  const missing = required.filter((key) => {
    const value = config[key];
    return typeof value !== 'string' || value.trim() === '';
  });
  if (missing.length > 0) {
    throw new Error(
      `Faltan variables de entorno críticas: ${missing.join(', ')}. ` +
        `Defínelas en el archivo .env o en el entorno del sistema.`,
    );
  }

  return config;
}
import { LoggerMiddleware } from './common/middleware/logger.middleware.js';
import { AuthModule } from './modules/auth/auth.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),

    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT as string, 10),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [Table, Reservation],
      autoLoadEntities: true,
      synchronize: true, // Solo en desarrollo
    }),

    ReservationsModule,
    TablesModule,
    CategoriesModule,
    ProductModule,
    CustomersModule,
    AuthModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
