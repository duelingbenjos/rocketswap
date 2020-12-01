import { Entity, Column, PrimaryColumn, BaseEntity } from "typeorm";

@Entity()
export class BalanceEntity extends BaseEntity {
	@PrimaryColumn()
	vk: string;

	@Column({ type: "simple-json" })
	balances: UserBalancesType;
}

export async function updateUserBalance(balance_dto: BalanceType) {
	const { contract_name, amount, vk } = balance_dto;
	let entity = await BalanceEntity.findOne(vk);
	if (!entity) {
		entity = new BalanceEntity();
		entity.vk = vk;
		entity.balances = {};
	}
	entity.balances[contract_name] = amount;
	return await entity.save();
}

export type UserBalancesType = {
	[key: string]: number;
};

export type BalanceType = {
	contract_name: string;
	vk: string;
	amount: number;
};
