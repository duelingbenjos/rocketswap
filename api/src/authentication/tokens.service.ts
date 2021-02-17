import {
	Injectable,
	Logger,
	UnprocessableEntityException
} from "@nestjs/common";
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
	private logger: Logger = new Logger("TokensService");

	public constructor(tokens: RefreshTokensRepository, jwt: JwtService) {
		this.tokens = tokens;
		this.jwt = jwt;
	}

	public async generateAccessToken(user: NameEntity): Promise<string> {
		try {
			const opts: SignOptions = {
				...BASE_OPTIONS,
				subject: String(user.vk)
			};

			return this.jwt.signAsync({}, opts);
		} catch (err) {
			this.logger.error(err);
		}
	}

	public async generateRefreshToken(
		user: NameEntity,
		expiresIn: number
	): Promise<string> {
		try {
			const token = await this.tokens.createRefreshToken(user, expiresIn);

			const opts: SignOptions = {
				...BASE_OPTIONS,
				expiresIn,
				subject: String(user.vk),
				jwtid: String(token.id)
			};

			return this.jwt.signAsync({}, opts);
		} catch (err) {
			this.logger.error(err);
		}
	}

	public resolveRefreshToken = async (
		encoded: string
	): Promise<{ user: NameEntity; token: RefreshTokenEntity }> => {
		try {
			const payload = await this.decodeRefreshToken(encoded);
			const token = await this.getStoredTokenFromRefreshTokenPayload(
				payload
			);

			if (!token) {
				throw new UnprocessableEntityException(
					"Refresh token not found"
				);
			}

			if (token.is_revoked) {
				throw new UnprocessableEntityException("Refresh token revoked");
			}

			const user = await this.getUserFromRefreshTokenPayload(payload);

			if (!user) {
				throw new UnprocessableEntityException(
					"Refresh token malformed"
				);
			}

			return { user, token };
		} catch (err) {
			this.logger.error(err);
		}
	};

	public async createAccessTokenFromRefreshToken(
		refresh: string
	): Promise<{ token: string; user: NameEntity }> {
		try {
			const { user } = await this.resolveRefreshToken(refresh);

			const token = await this.generateAccessToken(user);

			return { user, token };
		} catch (err) {
			this.logger.error(err);
		}
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
		try {
			const subId = payload.sub;

			if (!subId) {
				throw new UnprocessableEntityException(
					"Refresh token malformed"
				);
			}
			return NameEntity.findOne(subId);
		} catch (err) {
			this.logger.error(err);
		}
	}

	private async getStoredTokenFromRefreshTokenPayload(
		payload: RefreshTokenPayload
	): Promise<RefreshTokenEntity | null> {
		try {
			const tokenId = payload.jti;
			this.logger.log(payload);
			if (!tokenId) {
				throw new UnprocessableEntityException(
					"Refresh token malformed"
				);
			}
			return this.tokens.findTokenById(tokenId);
		} catch (err) {
			this.logger.error(err);
		}
	}
}
