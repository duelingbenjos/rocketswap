import { NameEntity } from "src/entities/name.entity";
import { RefreshTokenEntity } from "../entities/refresh-token.entity";
export declare class RefreshTokensRepository {
    createRefreshToken(user: NameEntity, ttl: number): Promise<RefreshTokenEntity>;
    findTokenById(id: number): Promise<RefreshTokenEntity | null>;
}
