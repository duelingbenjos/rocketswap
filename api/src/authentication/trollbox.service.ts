import { Injectable, UnprocessableEntityException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { SignOptions, TokenExpiredError } from "jsonwebtoken";

import { NameEntity } from "../entities/name.entity";
import { RefreshTokensRepository } from "./refresh-token.repository";

import { RefreshTokenEntity } from "../entities/refresh-token.entity";
import { IKvp } from "../types/misc.types";
import { config } from "../config";
import { TokensService } from "./tokens.service";
import { AuthenticationPayload } from "./trollbox.controller";
import { SocketService } from "../socket.service";

@Injectable()
export class AuthService {
	public constructor(
		private readonly tokenService: TokensService,
		private readonly socket: SocketService
	) {}

	public async authenticate(state: IKvp[]) {
		const auth_state = state.find(
			(kvp) =>
				kvp.key.split(":")[0] ===
				`${config.identityContract}.auth_codes`
		);
		const auth_code = auth_state.key.split(":")[1];
		const vk = auth_state.value;

		const name_entity = await NameEntity.findOne(vk);

		console.log(name_entity);

		const token = await this.tokenService.generateAccessToken(name_entity);
		const refresh = await this.tokenService.generateRefreshToken(
			name_entity,
			60 * 60 * 24 * 7
		);

		console.log(token, refresh);

		const payload = this.buildResponsePayload(name_entity, token, refresh);

		const auth_response = {
			payload,
			socket_id: auth_code
		};

		this.socket.handleAuthenticateResponse(auth_response);
	}

	public buildResponsePayload(
		user: NameEntity,
		accessToken: string,
		refreshToken?: string
	): AuthenticationPayload {
		return {
			user: user,
			payload: {
				type: "bearer",
				token: accessToken,
				...(refreshToken ? { refresh_token: refreshToken } : {})
			}
		};
	}
}
