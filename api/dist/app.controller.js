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
exports.AppController = void 0;
const common_1 = require("@nestjs/common");
const balance_entity_1 = require("./entities/balance.entity");
const lp_points_entity_1 = require("./entities/lp-points.entity");
const pair_entity_1 = require("./entities/pair.entity");
const token_entity_1 = require("./entities/token.entity");
let AppController = class AppController {
    constructor() { }
    async getTokenList() {
        try {
            return await token_entity_1.TokenEntity.find();
        }
        catch (err) {
            throw new common_1.HttpException(err, 500);
        }
    }
    async getToken(params) {
        const { contract_name } = params;
        try {
            let tokenRes = await token_entity_1.TokenEntity.find({ contract_name });
            let token = tokenRes[tokenRes.length - 1];
            let lp_info = await pair_entity_1.PairEntity.findOne(contract_name);
            return { token, lp_info };
        }
        catch (err) {
            throw new common_1.HttpException(err, 500);
        }
    }
    async getMarketList() {
        try {
            return await token_entity_1.TokenEntity.find({ where: { has_market: true } });
        }
        catch (err) {
            throw new common_1.HttpException(err, 500);
        }
    }
    async getUserLpBalance(params) {
        const { vk } = params;
        try {
            return await lp_points_entity_1.LpPointsEntity.findOneOrFail(vk);
        }
        catch (err) {
            throw new common_1.HttpException(err, 500);
        }
    }
    async getPairsInfo(params) {
        const { contract_names } = params;
        const contract_names_arr = contract_names.split(",");
        try {
            if (contract_names_arr.length > 20) {
                throw "You may only request a maximum of 20 pairs at a time.";
            }
            const pair_proms = contract_names_arr.map((contract_name) => {
                return new Promise(async (resolve) => {
                    let tokenRes = await token_entity_1.TokenEntity.findOne({ contract_name });
                    let pairRes = await pair_entity_1.PairEntity.findOne(contract_name);
                    resolve(Object.assign(pairRes, tokenRes));
                });
            });
            const res = await Promise.all(pair_proms);
            const res_obj = {};
            res.forEach((pair) => {
                if (pair)
                    res_obj[pair.contract_name] = pair;
            });
            return res_obj;
        }
        catch (err) {
            throw new common_1.HttpException(err, 500);
        }
    }
    async getBalances(params) {
        try {
            let balances = await balance_entity_1.BalanceEntity.findOne(params.vk);
            if (!balances)
                balances = {
                    vk: params.vk,
                    balances: {}
                };
            return balances;
        }
        catch (err) {
            console.error(err);
            throw new common_1.HttpException(err, 500);
        }
    }
};
__decorate([
    common_1.Get("token_list"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AppController.prototype, "getTokenList", null);
__decorate([
    common_1.Get("token/:contract_name"),
    __param(0, common_1.Param()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "getToken", null);
__decorate([
    common_1.Get("market_list"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AppController.prototype, "getMarketList", null);
__decorate([
    common_1.Get("user_lp_balance/:vk"),
    __param(0, common_1.Param()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "getUserLpBalance", null);
__decorate([
    common_1.Get("get_pairs/:contract_names"),
    __param(0, common_1.Param()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "getPairsInfo", null);
__decorate([
    common_1.Get("balances/:vk"),
    __param(0, common_1.Param()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "getBalances", null);
AppController = __decorate([
    common_1.Controller("api"),
    __metadata("design:paramtypes", [])
], AppController);
exports.AppController = AppController;
//# sourceMappingURL=app.controller.js.map