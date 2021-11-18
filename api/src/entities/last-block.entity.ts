import { Entity, Column, BaseEntity, PrimaryGeneratedColumn, PrimaryColumn, Unique } from "typeorm";
import { log } from "../utils/logger";

@Entity()
export class LastBlockEntity extends BaseEntity {
	@PrimaryColumn()
	id: number;

	@Column({ unique: true })
	last_block: number;
}

export async function updateLastBlock(args: { block_num: number }) {
	try {
		const { block_num } = args;
		let entity = new LastBlockEntity();
		entity.last_block = block_num;
		await entity.save();
		log.log(`saved block_num: ${block_num}`);
	} catch (err) {
		log.warn({ err });
	}
}

export async function getLastProcessedBlock() {
	return (
		await LastBlockEntity.findOne({
			order: { last_block: "DESC" }
		})
	)?.last_block;
}

export async function startTrimLastBlocksTask() {
	setInterval(async () => {
		const blocks = await LastBlockEntity.find({
			order: { last_block: "DESC" }
		});
		if (blocks.length > 1) {
			for (let i = 1; i <= blocks.length; i++) {
				if (blocks[i]) {
					await blocks[i].remove();
				}
			}
		}
	}, 1000000);
}
