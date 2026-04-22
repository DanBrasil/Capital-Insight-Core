import { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
export declare class AppErrorFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost): void;
}
