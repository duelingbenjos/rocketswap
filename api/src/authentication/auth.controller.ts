import { Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";

import { LoginRequest, RefreshRequest, RegisterRequest } from "../requests";

import { NameEntity } from "../entities/name.entity";

import { TokensService } from "./tokens.service";
import { JWTGuard } from "./jwt.guard";
import { AuthService } from "./auth.service";

export interface AuthenticationPayload {
	user: NameEntity;
	payload: {
		type: string;
		token: string;
		refresh_token?: string;
	};
}

@Controller("/api/auth")
export class AuthenticationController {
	public constructor(
		private readonly tokens: TokensService,
		private readonly authService: AuthService
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

	@Get("/me")
	@UseGuards(JWTGuard)
	public async getUser(@Req() request) {
        const vk = request.user.vk;
        console.log(request)

		const user = await NameEntity.findOne(vk);

		return {
			status: "success",
			data: user
		};
	}
}
