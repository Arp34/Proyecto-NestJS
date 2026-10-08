import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger, ValidationPipe } from '@nestjs/common';

// Importamos el nuevo filtro de excepciones
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Registrar globalmente el Filtro de Excepciones
  app.useGlobalFilters(new AllExceptionsFilter());

  // Configuración global de validaciones
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Instanciamos el Logger de NestJS
  const logger = new Logger('Bootstrap');

  // Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('Restaurant Management API')
    .setDescription(
      'API Backend para la gestión de mesas, pedidos y menú del restaurante',
    )
    .setVersion('1.0')
    .addTag('tables')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ?? 3000;

  await app.listen(port);

  logger.log(`API corriendo en: http://localhost:${port}`);
  logger.log(`Swagger disponible en: http://localhost:${port}/api/docs`);
}

void bootstrap();