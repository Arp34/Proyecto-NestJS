import { Module } from '@nestjs/common';
import { CustomersModule } from '../customers/customers.module.js';
import { ProfileController } from './profile.controller.js';

@Module({
  imports: [CustomersModule],
  controllers: [ProfileController],
})
export class ProfileModule {}
