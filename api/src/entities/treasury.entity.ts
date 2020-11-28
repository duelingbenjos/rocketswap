import { Entity, Column, PrimaryColumn, BaseEntity } from 'typeorm'

@Entity()
export class TreasuryEntity extends BaseEntity {
	@PrimaryColumn()
	id: number

	@Column()
	balance: number
}

export const updateGameTreasury = async (amount: number) => {
	let treasury_entity = await TreasuryEntity.findOne()
	if (!treasury_entity) treasury_entity = new TreasuryEntity()
	treasury_entity.balance = amount
	await treasury_entity.save()
}
