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
exports.getTokenList = exports.saveTokenUpdate = exports.prepareAddToken = exports.saveToken = exports.AddTokenDto = exports.TokenEntity = void 0;
const utils_1 = require("../utils");
const typeorm_1 = require("typeorm");
let TokenEntity = class TokenEntity extends typeorm_1.BaseEntity {
};
__decorate([
    typeorm_1.PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], TokenEntity.prototype, "id", void 0);
__decorate([
    typeorm_1.Column({ nullable: true }),
    __metadata("design:type", String)
], TokenEntity.prototype, "token_symbol", void 0);
__decorate([
    typeorm_1.Column({ nullable: true }),
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
    __metadata("design:type", String)
], TokenEntity.prototype, "owner", void 0);
__decorate([
    typeorm_1.Column({ nullable: true }),
    __metadata("design:type", Boolean)
], TokenEntity.prototype, "has_market", void 0);
__decorate([
    typeorm_1.Column({ nullable: true }),
    __metadata("design:type", String)
], TokenEntity.prototype, "token_base64_svg", void 0);
__decorate([
    typeorm_1.Column({ nullable: true }),
    __metadata("design:type", String)
], TokenEntity.prototype, "token_base64_png", void 0);
__decorate([
    typeorm_1.Column({ nullable: true }),
    __metadata("design:type", String)
], TokenEntity.prototype, "token_logo_url", void 0);
TokenEntity = __decorate([
    typeorm_1.Entity()
], TokenEntity);
exports.TokenEntity = TokenEntity;
class AddTokenDto {
}
exports.AddTokenDto = AddTokenDto;
exports.saveToken = async (add_token_dto) => {
    const { token_symbol, token_name, base_supply, contract_name, developer, token_base64_svg, token_base64_png, token_logo_url, owner } = add_token_dto;
    if (!base_supply || !contract_name)
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
    entity.owner = owner;
    entity.token_base64_svg = token_base64_svg;
    entity.token_base64_png = token_base64_png;
    entity.token_logo_url = token_logo_url;
    return await entity.save();
};
function prepareAddToken(state) {
    var _a, _b, _c, _d, _e, _f;
    const contract_name = utils_1.getContractName(state);
    const token_symbol = ((_a = state.find((kvp) => kvp.key === `${contract_name}.token_symbol`)) === null || _a === void 0 ? void 0 : _a.value) || '';
    const token_name = ((_b = state.find((kvp) => kvp.key === `${contract_name}.token_name`)) === null || _b === void 0 ? void 0 : _b.value) || '';
    const developer = state.find((kvp) => kvp.key === `${contract_name}.__developer__`).value;
    const owner = ((_c = state.find((kvp) => kvp.key === `${contract_name}.__owner__`)) === null || _c === void 0 ? void 0 : _c.value) || "";
    const supply_kvp = state.find((kvp) => kvp.key.includes(`${contract_name}.balances`));
    const token_base64_svg = ((_d = state.find((kvp) => kvp.key === `${contract_name}.token_base64_svg`)) === null || _d === void 0 ? void 0 : _d.value) || '';
    const token_base64_png = ((_e = state.find((kvp) => kvp.key === `${contract_name}.token_base64_png`)) === null || _e === void 0 ? void 0 : _e.value) || '';
    const token_logo_url = ((_f = state.find((kvp) => kvp.key === `${contract_name}.token_logo_url`)) === null || _f === void 0 ? void 0 : _f.value) || '';
    const base_supply = supply_kvp.value;
    const token_seed_holder = supply_kvp.key.split(":")[1];
    return {
        contract_name,
        token_name,
        token_symbol,
        base_supply,
        token_seed_holder,
        developer,
        token_base64_svg,
        token_base64_png,
        token_logo_url,
        owner
    };
}
exports.prepareAddToken = prepareAddToken;
async function saveTokenUpdate(state) {
    var _a, _b, _c, _d, _e;
    const contract_name = utils_1.getContractName(state);
    const token_base64_svg = ((_a = state.find((kvp) => kvp.key === `${contract_name}.token_base64_svg`)) === null || _a === void 0 ? void 0 : _a.value) || '';
    const token_base64_png = ((_b = state.find((kvp) => kvp.key === `${contract_name}.token_base64_png`)) === null || _b === void 0 ? void 0 : _b.value) || '';
    const token_logo_url = ((_c = state.find((kvp) => kvp.key === `${contract_name}.token_logo_url`)) === null || _c === void 0 ? void 0 : _c.value) || '';
    const token_symbol = ((_d = state.find((kvp) => kvp.key === `${contract_name}.token_symbol`)) === null || _d === void 0 ? void 0 : _d.value) || '';
    const token_name = ((_e = state.find((kvp) => kvp.key === `${contract_name}.token_name`)) === null || _e === void 0 ? void 0 : _e.value) || '';
    const update_obj = { token_base64_png, token_base64_svg, token_logo_url, token_symbol, token_name };
    try {
        const entity = await TokenEntity.findOne(contract_name);
        if (!entity)
            return;
        for (let key in update_obj) {
            if (update_obj[key]) {
                entity[key] = update_obj[key];
            }
        }
        await entity.save();
    }
    catch (err) {
        console.error(err);
    }
}
exports.saveTokenUpdate = saveTokenUpdate;
async function getTokenList() {
    const tokens = await TokenEntity.find();
    return tokens.map((token) => token.contract_name);
}
exports.getTokenList = getTokenList;
//# sourceMappingURL=token.entity.js.map