import { Injectable, UnprocessableEntityException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { SignOptions, TokenExpiredError } from "jsonwebtoken";

import { NameEntity } from "../entities/name.entity";
import { RefreshTokensRepository } from "./refresh-token.repository";

import { RefreshTokenEntity } from "../entities/refresh-token.entity";

const BASE_OPTIONS: SignOptions = {
	issuer: "https://my-app.com",
	audience: "https://my-app.com"
};

export interface RefreshTokenPayload {
	jti: number;
	sub: number;
}

@Injectable()
export class TokensService {
	private readonly tokens: RefreshTokensRepository;
	private readonly jwt: JwtService;

	public constructor(tokens: RefreshTokensRepository, jwt: JwtService) {
		this.tokens = tokens;
		this.jwt = jwt;
	}

	public async generateAccessToken(user: NameEntity): Promise<string> {
		const opts: SignOptions = {
			...BASE_OPTIONS,
			subject: String(user.vk)
		};

		return this.jwt.signAsync({}, opts);
	}

	public async generateRefreshToken(
		user: NameEntity,
		expiresIn: number
	): Promise<string> {
		const token = await this.tokens.createRefreshToken(user, expiresIn);

		const opts: SignOptions = {
			...BASE_OPTIONS,
			expiresIn,
			subject: String(user.vk),
			jwtid: String(token.id)
		};

		return this.jwt.signAsync({}, opts);
	}

	public async resolveRefreshToken(
		encoded: string
	): Promise<{ user: NameEntity; token: RefreshTokenEntity }> {
		const payload = await this.decodeRefreshToken(encoded);
		const token = await this.getStoredTokenFromRefreshTokenPayload(payload);

		if (!token) {
			throw new UnprocessableEntityException("Refresh token not found");
		}

		if (token.is_revoked) {
			throw new UnprocessableEntityException("Refresh token revoked");
		}

		const user = await this.getUserFromRefreshTokenPayload(payload);

		if (!user) {
			throw new UnprocessableEntityException("Refresh token malformed");
		}

		return { user, token };
	}

	public async createAccessTokenFromRefreshToken(
		refresh: string
	): Promise<{ token: string; user: NameEntity }> {
		const { user } = await this.resolveRefreshToken(refresh);

		const token = await this.generateAccessToken(user);

		return { user, token };
	}

	private async decodeRefreshToken(
		token: string
	): Promise<RefreshTokenPayload> {
		try {
			return this.jwt.verifyAsync(token);
		} catch (e) {
			if (e instanceof TokenExpiredError) {
				throw new UnprocessableEntityException("Refresh token expired");
			} else {
				throw new UnprocessableEntityException(
					"Refresh token malformed"
				);
			}
		}
	}

	private async getUserFromRefreshTokenPayload(
		payload: RefreshTokenPayload
	): Promise<NameEntity> {
		const subId = payload.sub;

		if (!subId) {
			throw new UnprocessableEntityException("Refresh token malformed");
		}

		return NameEntity.findOne(subId);
	}

	private async getStoredTokenFromRefreshTokenPayload(
		payload: RefreshTokenPayload
	): Promise<RefreshTokenEntity | null> {
		const tokenId = payload.jti;
        console.log(payload)
		if (!tokenId) {
			throw new UnprocessableEntityException("Refresh token malformed");
		}

		return this.tokens.findTokenById(tokenId);
	}
}
