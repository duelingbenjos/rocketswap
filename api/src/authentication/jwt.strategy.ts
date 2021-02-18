import { Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

import { NameEntity } from "../entities/name.entity";

export interface AccessTokenPayload {
	sub: string;
	exp: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	private logger: Logger = new Logger("JwtStrategy");

	public constructor(logger: Logger) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: true,
			secretOrKey: "<SECRET KEY>",
			signOptions: {
				expiresIn: "1m"
			}
		});
	}

	async validate(payload: AccessTokenPayload): Promise<NameEntity> {
		const { sub: vk, exp } = payload;
		const user = await NameEntity.findOne(vk);
		if (!user || Date.now() > exp*1000) {
			throw new UnauthorizedException();
		}
		return user;
	}
}
