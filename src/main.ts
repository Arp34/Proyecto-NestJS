import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('Restaurant Management API')
    .setDescription('API Backend para la gestión de mesas, pedidos y menú del restaurante')
    .setVersion('1.0')
    .addTag('tables')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`App corriendo en: http://localhost:${port}`);
  console.log(`Swagger disponible en: http://localhost:${port}/api/docs`);
}
bootstrap();