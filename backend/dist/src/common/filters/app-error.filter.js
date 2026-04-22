"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppErrorFilter = void 0;
const common_1 = require("@nestjs/common");
let AppErrorFilter = class AppErrorFilter {
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        let statusCode = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        const errorResponse = {
            message: 'Erro interno do servidor.',
        };
        if (exception instanceof common_1.HttpException) {
            statusCode = exception.getStatus();
            const payload = exception.getResponse();
            if (typeof payload === 'string') {
                errorResponse.message = payload;
            }
            else if (typeof payload === 'object' && payload !== null) {
                const asRecord = payload;
                const message = asRecord.message;
                if (Array.isArray(message) && message.length > 0) {
                    const firstMessage = message[0];
                    if (typeof firstMessage === 'string') {
                        errorResponse.message = firstMessage;
                    }
                }
                else if (typeof message === 'string') {
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
};
exports.AppErrorFilter = AppErrorFilter;
exports.AppErrorFilter = AppErrorFilter = __decorate([
    (0, common_1.Catch)()
], AppErrorFilter);
//# sourceMappingURL=app-error.filter.js.map