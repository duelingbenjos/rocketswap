import {
	Body,
	Controller,
	Get,
	HttpException,
	Logger,
	Post,
	Req,
	UseGuards
} from "@nestjs/common";

import { RefreshRequest } from "../requests";

import { NameEntity } from "../entities/name.entity";

import { TokensService } from "./tokens.service";
import { JWTGuard } from "./jwt.guard";
import { AuthService } from "./trollbox.service";
import { SocketService } from "../socket.service";
import { ITrollBoxMessage } from "src/types/websocket.types";
import {
	saveTrollChat
} from "../entities/chat-history.entity";

export interface AuthenticationPayload {
	user: NameEntity;
	payload: {
		type: string;
		token: string;
		refresh_token?: string;
	};
}

@Controller("/api/trollbox")
export class TrollboxController {
	private logger: Logger = new Logger("TrollboxController");

	public constructor(
		private readonly tokens: TokensService,
		private readonly authService: AuthService,
		private readonly socketService: SocketService
	) {}

	@Post("/refresh")
	public async refresh(@Body() body: RefreshRequest) {
		const {
			user,
			token
		} = await this.tokens.createAccessTokenFromRefreshToken(
			body.refresh_token
		);

		const payload = this.authService.buildResponsePayload(user, token);

		return {
			status: "success",
			data: payload
		};
	}

	@Post("/message")
	@UseGuards(JWTGuard)
	public async send_message(@Req() request) {
		const {
			user,
			body: { message }
		} = request;
		if (typeof message !== "string") {
			throw new HttpException("Message must be a string ! :(", 500);
		} else if (!message) {
			return;
		} else if (message.length > 200) {
			throw new HttpException(
				"Message is too long (must be under 200 characters)",
				500
			);
		}
		const ws_payload: ITrollBoxMessage = {
			sender: user,
			message,
			timestamp: Date.now()
		};
		this.socketService.handleTrollboxMsg(ws_payload);
		try {
			await saveTrollChat(ws_payload);
		} catch (err) {
			this.logger.error(err)
		}
	}

	@Get("/me")
	@UseGuards(JWTGuard)
	public async getUser(@Req() request) {
		const vk = request.user.vk;
		console.log(request.user);

		const user = await NameEntity.findOne(vk);

		return {
			status: "success",
			data: user
		};
	}
}
