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
exports.AuthenticationController = void 0;
const common_1 = require("@nestjs/common");
const requests_1 = require("../requests");
const name_entity_1 = require("../entities/name.entity");
const tokens_service_1 = require("./tokens.service");
const jwt_guard_1 = require("./jwt.guard");
const auth_service_1 = require("./auth.service");
let AuthenticationController = class AuthenticationController {
    constructor(tokens, authService) {
        this.tokens = tokens;
        this.authService = authService;
    }
    async refresh(body) {
        const { user, token } = await this.tokens.createAccessTokenFromRefreshToken(body.refresh_token);
        const payload = this.authService.buildResponsePayload(user, token);
        return {
            status: "success",
            data: payload
        };
    }
    async getUser(request) {
        const vk = request.user.vk;
        console.log(request);
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
], AuthenticationController.prototype, "refresh", null);
__decorate([
    common_1.Get("/me"),
    common_1.UseGuards(jwt_guard_1.JWTGuard),
    __param(0, common_1.Req()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthenticationController.prototype, "getUser", null);
AuthenticationController = __decorate([
    common_1.Controller("/api/auth"),
    __metadata("design:paramtypes", [tokens_service_1.TokensService,
        auth_service_1.AuthService])
], AuthenticationController);
exports.AuthenticationController = AuthenticationController;
//# sourceMappingURL=auth.controller.js.map