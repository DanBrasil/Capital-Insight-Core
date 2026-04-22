import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';

interface ErrorResponseBody {
  message: string;
  error?: string;
  field?: string;
  code?: string;
}

@Catch()
export class AppErrorFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    const errorResponse: ErrorResponseBody = {
      message: 'Erro interno do servidor.',
    };

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const payload = exception.getResponse();

      if (typeof payload === 'string') {
        errorResponse.message = payload;
      } else if (typeof payload === 'object' && payload !== null) {
        const asRecord = payload as Record<string, unknown>;
        const message = asRecord.message;

        if (Array.isArray(message) && message.length > 0) {
          const firstMessage = message[0];
          if (typeof firstMessage === 'string') {
            errorResponse.message = firstMessage;
          }
        } else if (typeof message === 'string') {
          errorResponse.message = message;
        }

        if (typeof asRecord.error === 'string') {
          errorResponse.error = asRecord.error;
        }
        if (typeof asRecord.field === 'string') {
          errorResponse.field = asRecord.field;
        }
        if (typeof asRecord.code === 'string') {
          errorResponse.code = asRecord.code;
        }
      }
    }

    response.status(statusCode).json(errorResponse);
  }
}
