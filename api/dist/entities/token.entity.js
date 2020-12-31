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
exports.getOneToken = exports.getTokenList = exports.prepareAddToken = exports.saveToken = exports.AddTokenDto = exports.TokenEntity = void 0;
const utils_1 = require("../utils");
const typeorm_1 = require("typeorm");
let TokenEntity = class TokenEntity extends typeorm_1.BaseEntity {
};
__decorate([
    typeorm_1.PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], TokenEntity.prototype, "id", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], TokenEntity.prototype, "token_symbol", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], TokenEntity.prototype, "token_name", void 0);
__decorate([
    typeorm_1.Column({ nullable: true }),
    __metadata("design:type", Number)
], TokenEntity.prototype, "base_supply", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], TokenEntity.prototype, "contract_name", void 0);
__decorate([
    typeorm_1.Column({ nullable: true }),
    __metadata("design:type", String)
], TokenEntity.prototype, "developer", void 0);
__decorate([
    typeorm_1.Column({ nullable: true }),
    __metadata("design:type", Boolean)
], TokenEntity.prototype, "has_market", void 0);
TokenEntity = __decorate([
    typeorm_1.Entity()
], TokenEntity);
exports.TokenEntity = TokenEntity;
class AddTokenDto {
}
exports.AddTokenDto = AddTokenDto;
exports.saveToken = async (add_token_dto) => {
    const { token_symbol, token_name, base_supply, contract_name, developer } = add_token_dto;
    if (!token_symbol || !token_name || !base_supply || !contract_name)
        throw new Error("Field missing.");
    const exists = await TokenEntity.findOne(contract_name);
    if (exists)
        return;
    const entity = new TokenEntity();
    entity.base_supply = base_supply;
    entity.token_symbol = token_symbol;
    entity.token_name = token_name;
    entity.contract_name = contract_name;
    entity.developer = developer;
    return await entity.save();
};
function prepareAddToken(state) {
    const contract_name = utils_1.getContractName(state);
    const token_symbol = state.find((kvp) => kvp.key === `${contract_name}.token_symbol`).value;
    const token_name = state.find((kvp) => kvp.key === `${contract_name}.token_name`).value;
    const developer = state.find((kvp) => kvp.key === `${contract_name}.__developer__`).value;
    const supply_kvp = state.find((kvp) => kvp.key.includes(`${contract_name}.balances`));
    const base_supply = supply_kvp.value;
    const token_seed_holder = supply_kvp.key.split(":")[1];
    return {
        contract_name,
        token_name,
        token_symbol,
        base_supply,
        token_seed_holder,
        developer
    };
}
exports.prepareAddToken = prepareAddToken;
async function getTokenList() {
    const tokens = await TokenEntity.find();
    return tokens.map((token) => token.contract_name);
}
exports.getTokenList = getTokenList;
async function getOneToken() {
    const tokens = await TokenEntity.find({ contract_name: 'con_jeff_token_v4' });
    console.log(tokens);
    return tokens.map((token) => token.contract_name);
}
exports.getOneToken = getOneToken;
//# sourceMappingURL=token.entity.js.map