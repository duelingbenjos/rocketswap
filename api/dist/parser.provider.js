"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParserProvider = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("./config");
const token_entity_1 = require("./entities/token.entity");
const utils_1 = require("./utils");
const balance_entity_1 = require("./entities/balance.entity");
const pair_entity_1 = require("./entities/pair.entity");
const token_entity_2 = require("./entities/token.entity");
const lp_points_entity_1 = require("./entities/lp-points.entity");
const price_entity_1 = require("./entities/price.entity");
let ParserProvider = class ParserProvider {
    onModuleInit() {
        this.updateTokenList();
    }
    async updateTokenList() {
        const token_list_update = await token_entity_1.getTokenList();
        this.token_contract_list = token_list_update;
    }
    async parseBlock(update) {
        const { block, handleClientUpdate } = update;
        const { state, fn, contract: contract_name } = block;
        try {
            if (contract_name === "submission" && fn === "submit_contract") {
                const contract_str = utils_1.getContractCode(state);
                const token_is_valid = utils_1.validateTokenContract(contract_str);
                if (token_is_valid) {
                    const add_token_dto = token_entity_1.prepareAddToken(state);
                    await token_entity_1.saveToken(add_token_dto);
                    const { contract_name, token_seed_holder: vk, base_supply: amount } = add_token_dto;
                    const res = await balance_entity_1.updateBalance({
                        amount,
                        contract_name,
                        vk
                    });
                    handleClientUpdate({
                        action: "balance_update",
                        payload: res
                    });
                }
                await this.updateTokenList();
                return;
            }
            else if (contract_name === config_1.config.contractName) {
                await processAmmBlock(state, handleClientUpdate);
                return;
            }
            else if (this.token_contract_list.includes(contract_name)) {
                await balance_entity_1.saveTransfer(state, handleClientUpdate);
                await token_entity_2.updateLogo(state, contract_name);
            }
            else {
            }
        }
        catch (err) {
            console.error(err);
        }
    }
};
ParserProvider = __decorate([
    common_1.Injectable()
], ParserProvider);
exports.ParserProvider = ParserProvider;
async function processAmmBlock(state, handleClientUpdate) {
    try {
        await pair_entity_1.savePair(state);
        await balance_entity_1.saveTransfer(state, handleClientUpdate);
        await pair_entity_1.savePairLp(state);
        await lp_points_entity_1.saveUserLp(state);
        await pair_entity_1.saveReserves(state, handleClientUpdate);
        await price_entity_1.savePrice(state, handleClientUpdate);
    }
    catch (err) {
        console.error(err);
    }
}
//# sourceMappingURL=parser.provider.js.map