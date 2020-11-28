import {
	Entity,
	Column,
	PrimaryColumn,
	BaseEntity,
	PrimaryGeneratedColumn
} from 'typeorm'

@Entity()
export class TableLogEntity extends BaseEntity {
	@PrimaryGeneratedColumn()
	id: string

	@Column()
	game_id: string

	@Column()
	message: string

	@Column()
	datetime: string = Date.now().toString()
}

export async function addToTableLog(game_id: string, message: string) {
	const entry = new TableLogEntity()
	entry.game_id = game_id
	entry.message = message
	return await entry.save()
}
