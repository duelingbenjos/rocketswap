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
exports.TokensService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const jsonwebtoken_1 = require("jsonwebtoken");
const name_entity_1 = require("../entities/name.entity");
const refresh_token_repository_1 = require("./refresh-token.repository");
const BASE_OPTIONS = {
    issuer: "https://my-app.com",
    audience: "https://my-app.com"
};
let TokensService = class TokensService {
    constructor(tokens, jwt) {
        this.tokens = tokens;
        this.jwt = jwt;
    }
    async generateAccessToken(user) {
        const opts = Object.assign(Object.assign({}, BASE_OPTIONS), { subject: String(user.vk) });
        return this.jwt.signAsync({}, opts);
    }
    async generateRefreshToken(user, expiresIn) {
        const token = await this.tokens.createRefreshToken(user, expiresIn);
        const opts = Object.assign(Object.assign({}, BASE_OPTIONS), { expiresIn, subject: String(user.vk), jwtid: String(token.id) });
        return this.jwt.signAsync({}, opts);
    }
    async resolveRefreshToken(encoded) {
        const payload = await this.decodeRefreshToken(encoded);
        const token = await this.getStoredTokenFromRefreshTokenPayload(payload);
        if (!token) {
            throw new common_1.UnprocessableEntityException("Refresh token not found");
        }
        if (token.is_revoked) {
            throw new common_1.UnprocessableEntityException("Refresh token revoked");
        }
        const user = await this.getUserFromRefreshTokenPayload(payload);
        if (!user) {
            throw new common_1.UnprocessableEntityException("Refresh token malformed");
        }
        return { user, token };
    }
    async createAccessTokenFromRefreshToken(refresh) {
        const { user } = await this.resolveRefreshToken(refresh);
        const token = await this.generateAccessToken(user);
        return { user, token };
    }
    async decodeRefreshToken(token) {
        try {
            return this.jwt.verifyAsync(token);
        }
        catch (e) {
            if (e instanceof jsonwebtoken_1.TokenExpiredError) {
                throw new common_1.UnprocessableEntityException("Refresh token expired");
            }
            else {
                throw new common_1.UnprocessableEntityException("Refresh token malformed");
            }
        }
    }
    async getUserFromRefreshTokenPayload(payload) {
        const subId = payload.sub;
        if (!subId) {
            throw new common_1.UnprocessableEntityException("Refresh token malformed");
        }
        return name_entity_1.NameEntity.findOne(subId);
    }
    async getStoredTokenFromRefreshTokenPayload(payload) {
        const tokenId = payload.jti;
        console.log(payload);
        if (!tokenId) {
            throw new common_1.UnprocessableEntityException("Refresh token malformed");
        }
        return this.tokens.findTokenById(tokenId);
    }
};
TokensService = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [refresh_token_repository_1.RefreshTokensRepository, jwt_1.JwtService])
], TokensService);
exports.TokensService = TokensService;
//# sourceMappingURL=tokens.service.js.map