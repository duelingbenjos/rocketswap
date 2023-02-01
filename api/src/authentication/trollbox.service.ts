import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { NameEntity } from "../entities/name.entity";
import { IKvp } from "../types/misc.types";
import { config } from "../config";
import { TokensService } from "./tokens.service";
import { AuthenticationPayload } from "./trollbox.controller";
import { SocketService } from "../services/socket.service";

@Injectable()
export class AuthService {
	public constructor(
		private readonly tokenService: TokensService,
		@Inject(forwardRef(() => SocketService))
		private readonly socket: SocketService
	) {}

	public async authenticate(state: IKvp[]) {
		const auth_state = state.find(
			(kvp) =>
				kvp.key.split(":")[0] ===
				`${config.identity_contract}.auth_codes`
		);
		const auth_code = auth_state.key.split(":")[1];
		const vk = auth_state.value;

		const name_entity = await NameEntity.findOne(vk);

		const token = await this.tokenService.generateAccessToken(name_entity);
		const refresh = await this.tokenService.generateRefreshToken(
			name_entity,
			60 * 60 * 24 * 7
		);

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
