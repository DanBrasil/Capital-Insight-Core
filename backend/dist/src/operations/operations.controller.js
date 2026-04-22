"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OperationsController = void 0;
const common_1 = require("@nestjs/common");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const feature_decorator_1 = require("../common/decorators/feature.decorator");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const feature_guard_1 = require("../common/guards/feature.guard");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const tenant_guard_1 = require("../common/guards/tenant.guard");
const create_operation_dto_1 = require("./dto/create-operation.dto");
const operation_filters_dto_1 = require("./dto/operation-filters.dto");
const update_operation_dto_1 = require("./dto/update-operation.dto");
const operations_service_1 = require("./operations.service");
let OperationsController = class OperationsController {
    operationsService;
    constructor(operationsService) {
        this.operationsService = operationsService;
    }
    async findAll(user, filters) {
        return this.operationsService.findAll(user.tenantId, user.id, filters);
    }
    async create(user, payload) {
        return this.operationsService.create(user.tenantId, user.id, payload);
    }
    async update(user, id, payload) {
        return this.operationsService.update(user.tenantId, user.id, id, payload);
    }
    async remove(user, id) {
        return this.operationsService.remove(user.tenantId, user.id, id);
    }
};
exports.OperationsController = OperationsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, operation_filters_dto_1.OperationFiltersDto]),
    __metadata("design:returntype", Promise)
], OperationsController.prototype, "findAll", null);
__decorate([
    (0, roles_decorator_1.Roles)('admin', 'manager'),
    (0, common_1.Post)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_operation_dto_1.CreateOperationDto]),
    __metadata("design:returntype", Promise)
], OperationsController.prototype, "create", null);
__decorate([
    (0, roles_decorator_1.Roles)('admin', 'manager'),
    (0, common_1.Put)(':id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_operation_dto_1.UpdateOperationDto]),
    __metadata("design:returntype", Promise)
], OperationsController.prototype, "update", null);
__decorate([
    (0, roles_decorator_1.Roles)('admin', 'manager'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, common_1.Delete)(':id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], OperationsController.prototype, "remove", null);
exports.OperationsController = OperationsController = __decorate([
    (0, feature_decorator_1.Feature)('operations'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, tenant_guard_1.TenantGuard, feature_guard_1.FeatureGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('operations'),
    __metadata("design:paramtypes", [operations_service_1.OperationsService])
], OperationsController);
//# sourceMappingURL=operations.controller.js.map