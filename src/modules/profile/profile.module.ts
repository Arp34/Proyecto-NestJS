import { Module } from '@nestjs/common';
import { CustomersModule } from '../customers/customers.module.js';
import { ProfileController } from './profile.controller.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [CustomersModule, AuthModule],
  controllers: [ProfileController],
})
export class ProfileModule {}
