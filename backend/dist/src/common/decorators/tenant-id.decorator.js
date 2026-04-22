"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantId = void 0;
const common_1 = require("@nestjs/common");
exports.TenantId = (0, common_1.createParamDecorator)((_data, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    const tenantId = request.headers['x-tenant-id'];
    if (Array.isArray(tenantId)) {
        return tenantId[0] ?? 'default';
    }
    return tenantId ?? 'default';
});
//# sourceMappingURL=tenant-id.decorator.js.map