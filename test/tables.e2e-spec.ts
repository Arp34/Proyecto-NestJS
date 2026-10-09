import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module.js';

describe('Tables status (e2e)', () => {
  let app: INestApplication<App>;
  let tableId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1', { exclude: ['api/docs'] });
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    // Creamos una mesa para probar (número aleatorio para no chocar con datos existentes)
    const number = Math.floor(Math.random() * 100000) + 1;
    const res = await request(app.getHttpServer())
      .post('/api/v1/tables')
      .send({ number, capacity: 4, zone: 'Test' })
      .expect(201);

    tableId = res.body.id;
    expect(res.body.status).toBe('AVAILABLE'); // RN-018
  });

  afterAll(async () => {
    await request(app.getHttpServer()).delete(`/api/v1/tables/${tableId}`);
    await app.close();
  });

  it('PATCH /api/v1/tables/:id/status -> 200 con estado válido', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/api/v1/tables/${tableId}/status`)
      .send({ status: 'OUT_OF_SERVICE' })
      .expect(200);

    expect(res.body.status).toBe('OUT_OF_SERVICE');
  });

  it('PATCH /api/v1/tables/:id/status -> 400 con estado inválido (RN-020)', () => {
    return request(app.getHttpServer())
      .patch(`/api/v1/tables/${tableId}/status`)
      .send({ status: 'BROKEN' })
      .expect(400);
  });

  it('PATCH /api/v1/tables/:id/status -> 404 si la mesa no existe', () => {
    return request(app.getHttpServer())
      .patch('/api/v1/tables/123e4567-e89b-12d3-a456-426614174999/status')
      .send({ status: 'OCCUPIED' })
      .expect(404);
  });
});