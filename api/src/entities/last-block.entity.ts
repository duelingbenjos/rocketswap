import { Entity, Column, BaseEntity, PrimaryGeneratedColumn, PrimaryColumn } from "typeorm";

@Entity()
export class LastBlockEntity extends BaseEntity {
	@PrimaryColumn()
	id: number;

	@Column()
	last_block: number;
}

export async function updateLastBlock(args: { block_num: number }) {
	const { block_num } = args;
	let entity = await LastBlockEntity.findOne();
	if (!entity) entity =  new LastBlockEntity()
	entity.last_block = block_num;
	await entity.save();
}
