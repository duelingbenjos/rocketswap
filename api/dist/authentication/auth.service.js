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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const name_entity_1 = require("../entities/name.entity");
const config_1 = require("../config");
const tokens_service_1 = require("./tokens.service");
const socket_service_1 = require("../socket.service");
let AuthService = class AuthService {
    constructor(tokenService, socket) {
        this.tokenService = tokenService;
        this.socket = socket;
    }
    async authenticate(state) {
        const auth_state = state.find((kvp) => kvp.key.split(":")[0] ===
            `${config_1.config.identityContract}.auth_codes`);
        const auth_code = auth_state.key.split(":")[1];
        const vk = auth_state.value;
        const name_entity = await name_entity_1.NameEntity.findOne(vk);
        console.log(name_entity);
        const token = await this.tokenService.generateAccessToken(name_entity);
        const refresh = await this.tokenService.generateRefreshToken(name_entity, 60 * 60 * 24 * 7);
        console.log(token, refresh);
        const payload = this.buildResponsePayload(name_entity, token, refresh);
        const auth_response = {
            payload,
            socket_id: auth_code
        };
        this.socket.handleAuthenticateResponse(auth_response);
    }
    buildResponsePayload(user, accessToken, refreshToken) {
        return {
            user: user,
            payload: Object.assign({ type: "bearer", token: accessToken }, (refreshToken ? { refresh_token: refreshToken } : {}))
        };
    }
};
AuthService = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [tokens_service_1.TokensService,
        socket_service_1.SocketService])
], AuthService);
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map