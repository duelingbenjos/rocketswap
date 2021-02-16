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
exports.TrollboxController = void 0;
const common_1 = require("@nestjs/common");
const requests_1 = require("../requests");
const name_entity_1 = require("../entities/name.entity");
const tokens_service_1 = require("./tokens.service");
const jwt_guard_1 = require("./jwt.guard");
const trollbox_service_1 = require("./trollbox.service");
const socket_service_1 = require("../socket.service");
const websocket_types_1 = require("../types/websocket.types");
const chat_history_entity_1 = require("../entities/chat-history.entity");
let TrollboxController = class TrollboxController {
    constructor(tokens, authService, socketService) {
        this.tokens = tokens;
        this.authService = authService;
        this.socketService = socketService;
        this.logger = new common_1.Logger("TrollboxController");
    }
    async refresh(body) {
        const { user, token } = await this.tokens.createAccessTokenFromRefreshToken(body.refresh_token);
        const payload = this.authService.buildResponsePayload(user, token);
        return {
            status: "success",
            data: payload
        };
    }
    async send_message(request) {
        const { user, body: { message } } = request;
        if (typeof message !== "string") {
            throw new common_1.HttpException("Message must be a string ! :(", 500);
        }
        else if (!message) {
            return;
        }
        else if (message.length > 200) {
            throw new common_1.HttpException("Message is too long (must be under 200 characters)", 500);
        }
        const ws_payload = {
            sender: user,
            message,
            timestamp: Date.now()
        };
        this.socketService.handleTrollboxMsg(ws_payload);
        try {
            await chat_history_entity_1.saveTrollChat(ws_payload);
        }
        catch (err) {
            this.logger.error(err);
        }
    }
    async getUser(request) {
        const vk = request.user.vk;
        console.log(request.user);
        const user = await name_entity_1.NameEntity.findOne(vk);
        return {
            status: "success",
            data: user
        };
    }
};
__decorate([
    common_1.Post("/refresh"),
    __param(0, common_1.Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [requests_1.RefreshRequest]),
    __metadata("design:returntype", Promise)
], TrollboxController.prototype, "refresh", null);
__decorate([
    common_1.Post("/message"),
    common_1.UseGuards(jwt_guard_1.JWTGuard),
    __param(0, common_1.Req()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TrollboxController.prototype, "send_message", null);
__decorate([
    common_1.Get("/me"),
    common_1.UseGuards(jwt_guard_1.JWTGuard),
    __param(0, common_1.Req()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TrollboxController.prototype, "getUser", null);
TrollboxController = __decorate([
    common_1.Controller("/api/trollbox"),
    __metadata("design:paramtypes", [tokens_service_1.TokensService,
        trollbox_service_1.AuthService,
        socket_service_1.SocketService])
], TrollboxController);
exports.TrollboxController = TrollboxController;
//# sourceMappingURL=trollbox.controller.js.map