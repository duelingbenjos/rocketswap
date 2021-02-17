import { Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

import { NameEntity } from "../entities/name.entity";

export interface AccessTokenPayload {
	sub: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	private logger: Logger = new Logger("JwtStrategy");

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
		const user = await NameEntity.findOne(vk);

		if (!user) {
			throw new UnauthorizedException();
		}
		return user;
	}
}
