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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateOperationDto = void 0;
const class_validator_1 = require("class-validator");
class CreateOperationDto {
    symbol;
    assetType;
    operationType;
    quantity;
    unitPrice;
    fees;
    operationDate;
    broker;
    notes;
}
exports.CreateOperationDto = CreateOperationDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 20),
    __metadata("design:type", String)
], CreateOperationDto.prototype, "symbol", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(['stock', 'fii', 'bdr', 'etf', 'fixed-income', 'crypto']),
    __metadata("design:type", String)
], CreateOperationDto.prototype, "assetType", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(['buy', 'sell']),
    __metadata("design:type", String)
], CreateOperationDto.prototype, "operationType", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0.000001),
    __metadata("design:type", Number)
], CreateOperationDto.prototype, "quantity", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0.0001),
    __metadata("design:type", Number)
], CreateOperationDto.prototype, "unitPrice", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateOperationDto.prototype, "fees", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateOperationDto.prototype, "operationDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 255),
    __metadata("design:type", String)
], CreateOperationDto.prototype, "broker", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateOperationDto.prototype, "notes", void 0);
//# sourceMappingURL=create-operation.dto.js.map