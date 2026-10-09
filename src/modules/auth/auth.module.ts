import { Module } from '@nestjs/common';
import { JwtModule, JwtSignOptions } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy.js';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SECRET');

        if (!secret) {
          throw new Error(
            'FALTA CONFIGURACIÓN: JWT_SECRET no está definido en el archivo .env',
          );
        }

        return {
          secret,
          signOptions: {
            expiresIn: (configService.get<string>('JWT_EXPIRES_IN') ||
              '1d') as JwtSignOptions['expiresIn'],
          },
        };
      },
    }),
  ],
  providers: [JwtStrategy],
  exports: [JwtModule], // Exportado para que el UsersModule pueda firmar tokens
})
export class AuthModule {}
