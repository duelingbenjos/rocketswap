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
exports.getTokenMetrics = exports.savePrice = exports.PriceEntity = void 0;
const misc_types_1 = require("../types/misc.types");
const utils_1 = require("../utils");
const typeorm_1 = require("typeorm");
const websocket_types_1 = require("../types/websocket.types");
const pair_entity_1 = require("./pair.entity");
let PriceEntity = class PriceEntity extends typeorm_1.BaseEntity {
    constructor() {
        super(...arguments);
        this.time = Date.now().toString();
    }
};
__decorate([
    typeorm_1.PrimaryGeneratedColumn(),
    __metadata("design:type", String)
], PriceEntity.prototype, "id", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], PriceEntity.prototype, "contract_name", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], PriceEntity.prototype, "price", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], PriceEntity.prototype, "time", void 0);
PriceEntity = __decorate([
    typeorm_1.Entity()
], PriceEntity);
exports.PriceEntity = PriceEntity;
async function savePrice(state, handleClientUpdate) {
    const price_kvp = state.find((kvp) => kvp.key.split(".")[1].split(":")[0] === "prices");
    if (!price_kvp)
        return;
    const contract_name = price_kvp.key.split(".")[1].split(":")[1];
    const price_entity = new PriceEntity();
    const price = utils_1.getVal(price_kvp);
    price_entity.contract_name = contract_name;
    price_entity.price = price;
    const pair_entity = await pair_entity_1.PairEntity.findOne(contract_name);
    pair_entity.price = price;
    const { lp, reserves } = pair_entity;
    handleClientUpdate({
        action: "metrics_update",
        contract_name,
        price,
        time: parseInt(price_entity.time),
        lp,
        reserves
    });
    await Promise.all([price_entity.save(), pair_entity.save()]);
}
exports.savePrice = savePrice;
async function getTokenMetrics(contract_name) {
    const pair_entity = await pair_entity_1.PairEntity.findOneOrFail({
        where: { contract_name }
    });
    const { price, time, lp, reserves } = pair_entity;
    return { contract_name, price, time: parseInt(time), reserves, lp };
}
exports.getTokenMetrics = getTokenMetrics;
//# sourceMappingURL=price.entity.js.map