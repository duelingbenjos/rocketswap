import {
	Entity,
	Column,
	PrimaryColumn,
	PrimaryGeneratedColumn,
	BaseEntity
} from 'typeorm'
import { IPlayersState } from '../../../shared/types'

@Entity()
export class HandEntity extends BaseEntity {
	@PrimaryColumn()
	hand_id: number // game_id + orbit_count + round_index

	@Column()
	game_id: string

	@Column()
	orbit_count: string

	@Column()
	round_index: string

	@Column()
	time: string = Date.now().toString()

	@Column()
	resolution: string // win / lose / continue ?

	@Column({ type: 'simple-json', nullable: true })
	card_1: string

	@Column({ type: 'simple-json', nullable: true })
	card_2: string

	@Column({ type: 'simple-json' })
	players_state: IPlayersState

	@Column({ type: 'simple-json', nullable: true })
	decision_card: string
}
