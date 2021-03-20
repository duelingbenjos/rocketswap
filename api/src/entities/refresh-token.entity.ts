import {
	Entity,
	Column,
	BaseEntity,
	PrimaryGeneratedColumn
} from "typeorm";


@Entity()
export class RefreshTokenEntity extends BaseEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	vk: string;

	@Column()
	is_revoked: boolean;

	@Column()
	expires: Date;
}

