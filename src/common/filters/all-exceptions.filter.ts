import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';

    // 1. Manejo de errores controlados y class-validator (HttpException)
    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse() as any;

      // Si es un error de validación, exceptionResponse.message es un array. Lo extraemos.
      message = exceptionResponse?.message || exception.message;
    }
    // 2. Manejo de violaciones únicas de TypeORM (PostgreSQL error 23505)
    else if (exception?.code === '23505') {
      statusCode = HttpStatus.CONFLICT; // 409
      message = 'El registro ya existe en la base de datos';
    }
    // 3. Manejo de errores desconocidos (Crash reales)
    else {
      this.logger.error(
        `Error crítico en ${request.method} ${request.originalUrl}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    // Estructura JSON estándar obligatoria requerida en la Issue
    response.status(statusCode).json({
      statusCode,
      message,
      timestamp: new Date().toISOString(),
      path: request.originalUrl,
    });
  }
}
