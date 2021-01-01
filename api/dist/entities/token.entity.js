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
exports.getTokenList = exports.updateLogo = exports.prepareAddToken = exports.saveToken = exports.AddTokenDto = exports.TokenEntity = void 0;
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
    __metadata("design:type", String)
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
__decorate([
    typeorm_1.Column({ nullable: true }),
    __metadata("design:type", String)
], TokenEntity.prototype, "logo_svg_base64", void 0);
TokenEntity = __decorate([
    typeorm_1.Entity()
], TokenEntity);
exports.TokenEntity = TokenEntity;
class AddTokenDto {
}
exports.AddTokenDto = AddTokenDto;
exports.saveToken = async (add_token_dto) => {
    const { token_symbol, token_name, base_supply, contract_name, developer, logo_svg_base64 } = add_token_dto;
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
    entity.logo_svg_base64 = logo_svg_base64;
    return await entity.save();
};
function prepareAddToken(state) {
    const contract_name = utils_1.getContractName(state);
    const token_symbol = state.find((kvp) => kvp.key === `${contract_name}.token_symbol`).value;
    const token_name = state.find((kvp) => kvp.key === `${contract_name}.token_name`).value;
    const developer = state.find((kvp) => kvp.key === `${contract_name}.__developer__`).value;
    const supply_kvp = state.find((kvp) => kvp.key.includes(`${contract_name}.balances`));
    const logo_svg_base64 = state.find((kvp) => kvp.key === `${contract_name}.token_base64_svg`);
    const base_supply = supply_kvp.value;
    const token_seed_holder = supply_kvp.key.split(":")[1];
    return {
        contract_name,
        token_name,
        token_symbol,
        base_supply,
        token_seed_holder,
        developer,
        logo_svg_base64: (logo_svg_base64 === null || logo_svg_base64 === void 0 ? void 0 : logo_svg_base64.value) || null
    };
}
exports.prepareAddToken = prepareAddToken;
async function updateLogo(state, contract_name) {
    const logo_change = state.find((kvp) => kvp.key.split(".")[1].split(":")[0] === "token_base64_svg");
    if (!logo_change)
        return;
    const tokenEntity = await TokenEntity.findOne({ contract_name });
    if (!tokenEntity)
        return;
    if (tokenEntity.logo_svg_base64 !== logo_change.value) {
        tokenEntity.logo_svg_base64 = logo_change.value;
        tokenEntity.save();
    }
}
exports.updateLogo = updateLogo;
async function getTokenList() {
    const tokens = await TokenEntity.find();
    return tokens.map((token) => token.contract_name);
}
exports.getTokenList = getTokenList;
//# sourceMappingURL=token.entity.js.map