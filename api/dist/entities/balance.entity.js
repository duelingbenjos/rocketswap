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
exports.saveTransfer = exports.updateBalance = exports.BalanceEntity = void 0;
const utils_1 = require("../utils");
const typeorm_1 = require("typeorm");
let BalanceEntity = class BalanceEntity extends typeorm_1.BaseEntity {
};
__decorate([
    typeorm_1.PrimaryColumn(),
    __metadata("design:type", String)
], BalanceEntity.prototype, "vk", void 0);
__decorate([
    typeorm_1.Column({ type: "simple-json" }),
    __metadata("design:type", Object)
], BalanceEntity.prototype, "balances", void 0);
BalanceEntity = __decorate([
    typeorm_1.Entity()
], BalanceEntity);
exports.BalanceEntity = BalanceEntity;
async function updateBalance(balance_dto) {
    const { contract_name, amount, vk } = balance_dto;
    let entity = await BalanceEntity.findOne(vk);
    if (!entity) {
        entity = new BalanceEntity();
        entity.vk = vk;
        entity.balances = {};
    }
    entity.balances[contract_name] = amount;
    return await entity.save();
}
exports.updateBalance = updateBalance;
async function saveTransfer(state, handleClientUpdate) {
    const balances_kvp = state.filter((kvp) => kvp.key.split(".")[1].split(":")[0] === "balances");
    const transfers = balances_kvp.filter((kvp) => kvp.key.split(":").length === 2);
    for (let kvp of transfers) {
        const { key, value } = kvp;
        const parts = key.split(".");
        const is_balance = parts[1].split(":")[0] === "balances" ? true : false;
        const vk = key.split(":")[1];
        const contract_name = parts[0];
        const amount = utils_1.getVal(kvp);
        if (is_balance && vk && contract_name) {
            try {
                const res = await updateBalance({ vk, contract_name, amount });
                handleClientUpdate({
                    action: "balance_update",
                    payload: res
                });
            }
            catch (err) {
                console.error(err);
            }
        }
    }
}
exports.saveTransfer = saveTransfer;
//# sourceMappingURL=balance.entity.js.map