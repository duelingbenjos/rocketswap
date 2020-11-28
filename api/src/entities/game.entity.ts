import { create } from 'domain'
import { Entity, Column, PrimaryColumn, BaseEntity } from 'typeorm'
import {
	DealDecisionCardDTO,
	DealHandDTO,
	GameDTO,
	ICard,
	IPlayersState,
	JoinTableDTO
} from '../../../../shared/types'

@Entity()
export class GameEntity extends BaseEntity {
	@PrimaryColumn()
	game_id: string

	@Column()
	game_state: string

	@Column()
	number_of_seats: number

	@Column()
	host: string

	@Column()
	ante: number

	@Column()
	minimum_amount: number

	@Column()
	pot_size: number

	@Column()
	round_index: number

	@Column()
	orbit_count: number

	@Column({ type: 'simple-array' })
	players: string[]

	@Column({ type: 'simple-array' })
	sitting_out: string[]

	@Column({ type: 'simple-array' })
	waiting: string[]

	@Column({ type: 'simple-array' })
	leaving: string[]

	@Column({ type: 'simple-json', nullable: true })
	card_1: ICard

	@Column({ type: 'simple-json', nullable: true })
	card_2: ICard

	@Column({ type: 'simple-json', nullable: true })
	decision_card: string

	@Column({ type: 'simple-json', nullable: true })
	players_state: IPlayersState

	@Column({ nullable: true })
	time_updated: string
}

export async function createGame(create_game_dto: GameDTO) {
	try {
		const game_entity = new GameEntity()
		for (let field in create_game_dto) {
			console.log(field, create_game_dto[field])
			if (create_game_dto[field].__fixed__) {
				game_entity[field] = create_game_dto[field].__fixed__
			} else {
				game_entity[field] = create_game_dto[field]
			}
		}
		await game_entity.save()
	} catch (err) {
		throw err
	}
}

export async function processJoinTable(join_table_dto: JoinTableDTO) {
	const { game_id, players, game_state } = join_table_dto
	const entity = await GameEntity.findOne(game_id)
	entity.players = players
	entity.game_state = game_state
	await entity.save()
	return entity
}

export async function getPreviousTableState(game_id: string) {
	return await GameEntity.findOne(game_id)
}

export async function processDealHand(deal_hand_dto: DealHandDTO) {
	const { game_id, card_1, card_2, pot_size } = deal_hand_dto
	const ent = await GameEntity.findOne(game_id)
	ent.game_id = game_id
	ent.card_1 = card_1
	ent.card_2 = card_2
	ent.pot_size = pot_size
	return await ent.save()
}

export async function processDealDecisionCard(dto: DealDecisionCardDTO) {
	const ent = await GameEntity.findOne(dto.game_id)
	for (let key in dto) {
		ent[key] = dto[key]
	}
	return await ent.save()
}
