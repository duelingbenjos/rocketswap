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
exports.saveTradeUpdate = exports.TradeHistoryEntity = void 0;
const misc_types_1 = require("../types/misc.types");
const typeorm_1 = require("typeorm");
let TradeHistoryEntity = class TradeHistoryEntity extends typeorm_1.BaseEntity {
    constructor() {
        super(...arguments);
        this.time = Date.now().toString();
    }
};
__decorate([
    typeorm_1.PrimaryGeneratedColumn(),
    __metadata("design:type", String)
], TradeHistoryEntity.prototype, "id", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], TradeHistoryEntity.prototype, "contract_name", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], TradeHistoryEntity.prototype, "token_symbol", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], TradeHistoryEntity.prototype, "price", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], TradeHistoryEntity.prototype, "time", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], TradeHistoryEntity.prototype, "amount", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], TradeHistoryEntity.prototype, "vk", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], TradeHistoryEntity.prototype, "type", void 0);
TradeHistoryEntity = __decorate([
    typeorm_1.Entity()
], TradeHistoryEntity);
exports.TradeHistoryEntity = TradeHistoryEntity;
async function saveTradeUpdate(args) {
    const entity = new TradeHistoryEntity();
    for (let arg in args) {
        entity[arg] = args[arg];
    }
    await entity.save();
}
exports.saveTradeUpdate = saveTradeUpdate;
//# sourceMappingURL=trade-history.entity.js.map