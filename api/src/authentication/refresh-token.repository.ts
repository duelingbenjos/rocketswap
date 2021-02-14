import { Injectable } from "@nestjs/common";
import { NameEntity } from "src/entities/name.entity";
// import { User } from '../../../models/user.model'
import { RefreshTokenEntity } from "../entities/refresh-token.entity";

@Injectable()
export class RefreshTokensRepository {
	public async createRefreshToken(
		user: NameEntity,
		ttl: number
	): Promise<RefreshTokenEntity> {
		const token = new RefreshTokenEntity();

		token.vk = user.vk;
		token.is_revoked = false;

		const expiration = new Date();
		expiration.setTime(expiration.getTime() + ttl);

		token.expires = expiration;

		return token.save();
	}

	public async findTokenById(id: number): Promise<RefreshTokenEntity | null> {
		return RefreshTokenEntity.findOne({
			where: {
				id
			}
		});
	}
}
