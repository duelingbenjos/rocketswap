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
exports.AppGateway = void 0;
const common_1 = require("@nestjs/common");
const websockets_1 = require("@nestjs/websockets");
const blockgrabber_1 = require("./blockgrabber");
const balance_entity_1 = require("./entities/balance.entity");
const lp_points_entity_1 = require("./entities/lp-points.entity");
const price_entity_1 = require("./entities/price.entity");
const parser_provider_1 = require("./parser.provider");
const websocket_types_1 = require("./types/websocket.types");
let AppGateway = class AppGateway {
    constructor(parser) {
        this.parser = parser;
        this.logger = new common_1.Logger("AppGateway");
        this.handleNewBlock = async (block) => {
            const { state, fn, contract } = block;
            await this.parser.parseBlock({
                block: {
                    state,
                    fn,
                    contract
                },
                handleClientUpdate: this.handleClientUpdate
            });
        };
        this.handleClientUpdate = async (update) => {
            let contract_name;
            switch (update.action) {
                case "metrics_update":
                    if (websocket_types_1.isMetricsUpdate(update))
                        contract_name = update.contract_name;
                    this.wss.emit(`price_feed:${contract_name}`, update);
                    this.logger.log("price update sent");
                    break;
                case "balance_update":
                    if (websocket_types_1.isBalanceUpdate(update)) {
                        this.wss.emit(`balance_update:${update.payload.vk}`, update);
                        this.logger.log(`balance update sent to : ${update.payload.vk}`);
                    }
            }
        };
        blockgrabber_1.default(this.handleNewBlock);
    }
    afterInit(server) {
        this.logger.log(`Websocket Initialised`);
    }
    handleLeaveRoom(client, room) {
        client.leave(room);
        client.emit("left_room", room);
    }
    async handleJoinRoom(client, room) {
        this.logger.log(room);
        client.join(room);
        client.emit("joined_room", room);
        const [prefix, subject] = room.split(":");
        switch (prefix) {
            case "price_feed":
                this.handleJoinPriceFeed(subject, client);
                break;
            case "user_lp_feed":
                this.handleJoinUserLpFeed(subject, client);
                break;
            case "balance_feed":
                this.handleJoinBalanceFeed(subject, client);
                break;
        }
    }
    async handleJoinBalanceFeed(vk, client) {
        console.log(`${vk} joined balance feed`);
        try {
            let balances = await balance_entity_1.BalanceEntity.findOne(vk);
            if (!balances)
                balances = {
                    vk: vk,
                    balances: {}
                };
            client.emit(`balance_list:${vk}`, balances);
        }
        catch (err) {
            console.error(err);
        }
    }
    async handleJoinUserLpFeed(vk, client) {
        try {
            const user_lp_points = await lp_points_entity_1.LpPointsEntity.findOneOrFail(vk);
            const { points } = user_lp_points;
            const user_lp_action = {
                action: "user_lp_update",
                points
            };
            client.emit(`user_lp_feed:${vk}`, user_lp_action);
        }
        catch (err) {
            this.logger.error(err);
        }
    }
    async handleJoinPriceFeed(contract_name, client) {
        try {
            const metrics = await price_entity_1.getTokenMetrics(contract_name);
            const metrics_action = Object.assign({ action: "metrics_update" }, metrics);
            this.logger.log(metrics_action);
            client.emit(`price_feed:${contract_name}`, metrics_action);
        }
        catch (err) {
            this.logger.error(err);
        }
    }
    handleDisconnect(client) {
        this.logger.log(`Client disconnected: ${client.id}`);
    }
    async handleConnection(socket, ...args) {
        this.logger.log(`Client connected: ${socket.id}`);
    }
};
__decorate([
    websockets_1.WebSocketServer(),
    __metadata("design:type", Object)
], AppGateway.prototype, "wss", void 0);
__decorate([
    websockets_1.SubscribeMessage("leave_room"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], AppGateway.prototype, "handleLeaveRoom", null);
__decorate([
    websockets_1.SubscribeMessage("join_room"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AppGateway.prototype, "handleJoinRoom", null);
AppGateway = __decorate([
    websockets_1.WebSocketGateway(),
    __metadata("design:paramtypes", [parser_provider_1.ParserProvider])
], AppGateway);
exports.AppGateway = AppGateway;
//# sourceMappingURL=app.gateway.js.map