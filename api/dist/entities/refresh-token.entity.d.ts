import { BaseEntity } from "typeorm";
export declare class RefreshTokenEntity extends BaseEntity {
    id: number;
    vk: string;
    is_revoked: boolean;
    expires: Date;
}
