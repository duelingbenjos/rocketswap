import { Injectable, Logger } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

import { NameEntity } from "../entities/name.entity";

export interface AccessTokenPayload {
	sub: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	private logger: Logger = new Logger("AppGateway");

	public constructor(logger: Logger) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: "<SECRET KEY>",
			signOptions: {
				expiresIn: "5m"
			}
		});
	}

	async validate(payload: AccessTokenPayload): Promise<NameEntity> {
		const { sub: vk } = payload;
		this.logger.log(payload);
		const user = await NameEntity.findOne(vk);

		if (!user) {
			return null;
		}
		return user;
	}
}
