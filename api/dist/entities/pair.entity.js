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
exports.savePairLp = exports.savePair = exports.saveReserves = exports.PairEntity = void 0;
const misc_types_1 = require("../types/misc.types");
const utils_1 = require("../utils");
const typeorm_1 = require("typeorm");
const websocket_types_1 = require("../types/websocket.types");
const token_entity_1 = require("./token.entity");
const trade_history_entity_1 = require("./trade-history.entity");
let PairEntity = class PairEntity extends typeorm_1.BaseEntity {
    constructor() {
        super(...arguments);
        this.time = Date.now().toString();
    }
};
__decorate([
    typeorm_1.PrimaryColumn(),
    __metadata("design:type", String)
], PairEntity.prototype, "contract_name", void 0);
__decorate([
    typeorm_1.Column({ nullable: true }),
    __metadata("design:type", String)
], PairEntity.prototype, "lp", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], PairEntity.prototype, "time", void 0);
__decorate([
    typeorm_1.Column({ nullable: true }),
    __metadata("design:type", String)
], PairEntity.prototype, "price", void 0);
__decorate([
    typeorm_1.Column({ nullable: true }),
    __metadata("design:type", String)
], PairEntity.prototype, "token_symbol", void 0);
__decorate([
    typeorm_1.Column({ nullable: true, type: "simple-json" }),
    __metadata("design:type", Array)
], PairEntity.prototype, "reserves", void 0);
PairEntity = __decorate([
    typeorm_1.Entity()
], PairEntity);
exports.PairEntity = PairEntity;
async function saveReserves(fn, state, handleClientUpdate, timestamp) {
    const reserve_kvp = state.find((kvp) => kvp.key.split(".")[1].split(":")[0] === "reserves");
    const price_kvp = state.find((kvp) => kvp.key.split(".")[1].split(":")[0] === "prices");
    const lp_kvp = state.find((kvp) => kvp.key.includes("lp_points") && kvp.key.split(":").length === 2);
    if (reserve_kvp) {
        let contract_name = reserve_kvp.key.split(":")[1];
        let vk_kvp = state.find((kvp) => {
            return (kvp.key.includes(`${contract_name}.balances`) &&
                utils_1.isLamdenKey(kvp.key.split(":")[1]));
        });
        let vk = vk_kvp.key.split(":")[1];
        let old_currency_reserve;
        let old_token_reserve;
        let reserves = [
            reserve_kvp.value[0].__fixed__,
            reserve_kvp.value[1].__fixed__
        ];
        let price = utils_1.getVal(price_kvp);
        let lp = utils_1.getVal(lp_kvp);
        let entity = await PairEntity.findOne(reserve_kvp.key.split(":")[1]);
        if (!entity) {
            entity = new PairEntity();
            entity.contract_name = contract_name;
            entity.reserves = reserves;
        }
        else {
            if (entity.reserves) {
                old_currency_reserve = entity.reserves[0];
                old_token_reserve = entity.reserves[1];
            }
            if (fn === "buy" || fn === "sell") {
                let amount_exchanged = getAmountExchanged(fn, old_token_reserve, reserves);
                updateTradeFeed({
                    contract_name,
                    token_symbol: entity.token_symbol,
                    type: fn,
                    amount: amount_exchanged,
                    price,
                    handleClientUpdate,
                    time: timestamp
                });
                trade_history_entity_1.saveTradeUpdate({
                    contract_name,
                    token_symbol: entity.token_symbol,
                    type: fn,
                    vk,
                    amount: amount_exchanged,
                    price,
                    time: timestamp
                });
            }
        }
        if (price_kvp)
            entity.price = price;
        if (lp_kvp)
            entity.lp = lp;
        if (reserves)
            entity.reserves = reserves;
        entity.time = Date.now().toString();
        await entity.save();
        handleClientUpdate({
            action: "metrics_update",
            contract_name,
            time: parseInt(entity.time),
            reserves: entity.reserves,
            lp: entity.lp,
            price: entity.price
        });
    }
}
exports.saveReserves = saveReserves;
const getAmountExchanged = (fn, old_token_reserve, reserves) => {
    return fn === "buy"
        ? (parseFloat(old_token_reserve) - parseFloat(reserves[1])).toString()
        : (parseFloat(reserves[1]) - parseFloat(old_token_reserve)).toString();
};
function updateTradeFeed(args) {
    const { type, amount, contract_name, token_symbol, price, handleClientUpdate, time } = args;
    const payload = {
        action: "trade_update",
        type,
        amount,
        contract_name,
        token_symbol,
        price,
        time
    };
    handleClientUpdate(payload);
}
async function savePair(state) {
    const pair_kvp = state.find((kvp) => kvp.key.split(".")[1].split(":")[0] === "pairs");
    if (!pair_kvp)
        return;
    const contract_name = pair_kvp.key.split(".")[1].split(":")[1];
    const pair_entity = new PairEntity();
    const token_entity = await token_entity_1.TokenEntity.findOne({
        where: { contract_name }
    });
    if (token_entity) {
        token_entity.has_market = true;
        await token_entity.save();
        pair_entity.token_symbol = token_entity.token_symbol;
    }
    pair_entity.contract_name = contract_name;
    await pair_entity.save();
}
exports.savePair = savePair;
async function savePairLp(state) {
    const lp_kvp = state.find((kvp) => kvp.key.includes("lp_points") && kvp.key.split(":").length === 2);
    if (lp_kvp) {
        const parts = lp_kvp.key.split(".")[1].split(":");
        if (parts.length === 2) {
            const contract_name = parts[1];
            let entity = await PairEntity.findOne(contract_name);
            if (!entity)
                entity = new PairEntity();
            entity.contract_name = contract_name;
            entity.lp = utils_1.getVal(lp_kvp);
            await entity.save();
        }
    }
}
exports.savePairLp = savePairLp;
//# sourceMappingURL=pair.entity.js.map