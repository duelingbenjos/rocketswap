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
exports.ParserProvider = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("./config");
const token_entity_1 = require("./entities/token.entity");
const utils_1 = require("./utils");
const balance_entity_1 = require("./entities/balance.entity");
const pair_entity_1 = require("./entities/pair.entity");
const lp_points_entity_1 = require("./entities/lp-points.entity");
const price_entity_1 = require("./entities/price.entity");
const socket_service_1 = require("./socket.service");
const name_entity_1 = require("./entities/name.entity");
const trollbox_service_1 = require("./authentication/trollbox.service");
let ParserProvider = class ParserProvider {
    constructor(socketService, authService) {
        this.socketService = socketService;
        this.authService = authService;
        this.action_que = [];
        this.parseBlock = async (update) => {
            const { block } = update;
            const { state, fn, contract: contract_name, timestamp } = block;
            try {
                if (contract_name === "submission" && fn === "submit_contract") {
                    const contract_str = utils_1.getContractCode(state);
                    const token_is_valid = utils_1.validateTokenContract(contract_str);
                    if (token_is_valid) {
                        const add_token_dto = token_entity_1.prepareAddToken(state);
                        const { contract_name, token_seed_holder: vk, base_supply: amount } = add_token_dto;
                        this.addToActionQue(balance_entity_1.updateBalance, {
                            amount,
                            contract_name,
                            vk,
                        });
                        this.addToActionQue(token_entity_1.saveToken, add_token_dto);
                        this.addToActionQue(this.updateTokenList);
                        await this.updateTokenList();
                    }
                    return;
                }
                else if (contract_name === config_1.config.contractName) {
                    this.addToActionQue(this.processAmmBlock, {
                        state,
                        fn,
                        timestamp
                    });
                    return;
                }
                else if (this.token_contract_list.includes(contract_name)) {
                    await balance_entity_1.saveTransfer(state, this.socketService.handleClientUpdate);
                    if (isUpdateFn(fn)) {
                        await token_entity_1.saveTokenUpdate(state);
                    }
                }
                else if (contract_name === config_1.config.identityContract) {
                    switch (fn) {
                        case 'setName':
                            this.addToActionQue(name_entity_1.setName, state);
                            break;
                        case 'auth':
                            this.authService.authenticate(state);
                            break;
                    }
                }
            }
            catch (err) {
                console.error(err);
            }
        };
        this.processAmmBlock = async (args) => {
            const { fn, state, timestamp } = args;
            try {
                await pair_entity_1.savePair(state);
                await balance_entity_1.saveTransfer(state, this.socketService.handleClientUpdate);
                await pair_entity_1.savePairLp(state);
                await lp_points_entity_1.saveUserLp(state);
                await pair_entity_1.saveReserves(fn, state, this.socketService.handleClientUpdate, timestamp);
                await price_entity_1.savePrice(state, this.socketService.handleClientUpdate);
            }
            catch (err) {
                console.error(err);
            }
        };
        this.executeActionQue = async (action_que) => {
            try {
                if (action_que.length) {
                    console.log(`ACTION QUE PROCESSING ${action_que.length} `);
                    const { action, args } = this.action_que[0];
                    if (args) {
                        await action(args);
                    }
                    else {
                        action();
                    }
                    this.action_que.splice(0, 1);
                    this.executeActionQue(action_que);
                }
                else {
                    this.action_que_processing = false;
                }
            }
            catch (err) {
                console.error(err);
                setTimeout(async () => this.executeActionQue(action_que), 1000);
            }
        };
        this.addToActionQue = (action, args) => {
            this.action_que.push({ action, args });
            console.log(`ADDING ITEM TO ACTION QUE : ${this.action_que.length} ACTIONS OUTSTANDING`);
            if (!this.action_que_processing) {
                this.action_que_processing = true;
                this.executeActionQue(this.action_que);
            }
        };
        this.updateTokenList = async () => {
            const token_list_update = await token_entity_1.getTokenList();
            this.token_contract_list = token_list_update;
        };
    }
    onModuleInit() {
        this.updateTokenList();
    }
};
ParserProvider = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [socket_service_1.SocketService, trollbox_service_1.AuthService])
], ParserProvider);
exports.ParserProvider = ParserProvider;
const isUpdateFn = (fn) => fn === "set_logo" || fn === "set_name" || fn === "set_symbol";
//# sourceMappingURL=parser.provider.js.map