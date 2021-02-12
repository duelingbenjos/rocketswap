import { JwtService } from "@nestjs/jwt";
import { NameEntity } from "../entities/name.entity";
import { RefreshTokensRepository } from "./refresh-token.repository";
import { RefreshTokenEntity } from "../entities/refresh-token.entity";
export interface RefreshTokenPayload {
    jti: number;
    sub: number;
}
export declare class TokensService {
    private readonly tokens;
    private readonly jwt;
    constructor(tokens: RefreshTokensRepository, jwt: JwtService);
    generateAccessToken(user: NameEntity): Promise<string>;
    generateRefreshToken(user: NameEntity, expiresIn: number): Promise<string>;
    resolveRefreshToken(encoded: string): Promise<{
        user: NameEntity;
        token: RefreshTokenEntity;
    }>;
    createAccessTokenFromRefreshToken(refresh: string): Promise<{
        token: string;
        user: NameEntity;
    }>;
    private decodeRefreshToken;
    private getUserFromRefreshTokenPayload;
    private getStoredTokenFromRefreshTokenPayload;
}
