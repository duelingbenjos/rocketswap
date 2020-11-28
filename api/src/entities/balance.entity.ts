import { Entity, Column, PrimaryColumn, BaseEntity } from 'typeorm'

@Entity()
export class BalanceEntity extends BaseEntity {
	@PrimaryColumn()
	id: string

	@Column({ nullable: true })
	game_balance: number

	@Column({ nullable: true })
	wallet_balance: number

	@Column({ nullable: true })
	amount_approved: number
}

export const processAddFunds = async (add_funds_dto: AddFundsDTO) => {
	const {
		address,
		game_balance,
		wallet_balance,
		amount_approved
	} = add_funds_dto
	let entity: BalanceEntity
	entity = await BalanceEntity.findOne(address)
	if (!entity) entity = new BalanceEntity()

	entity.id = address
	entity.game_balance = game_balance
	entity.wallet_balance = wallet_balance
	entity.amount_approved = amount_approved

	await entity.save()
	return entity
}

export const processApproval = async (
	address: string,
	approved: number,
	wallet_balance: number
) => {
	let entity: BalanceEntity
	entity = await BalanceEntity.findOne(address)
	if (!entity) entity = new BalanceEntity()

	entity.id = address
	entity.amount_approved = approved
	entity.wallet_balance = wallet_balance

	await entity.save()
}

export class AddFundsDTO {
	address: string
	game_balance: number
	wallet_balance: number
	amount_approved: number
}
