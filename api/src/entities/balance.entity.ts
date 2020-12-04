import { IKvp } from "src/types/misc.types";
import { Entity, Column, PrimaryColumn, BaseEntity } from "typeorm";

@Entity()
export class BalanceEntity extends BaseEntity implements IBalance {
	@PrimaryColumn()
	vk: string;

	@Column({ type: "simple-json" })
	balances: UserBalancesType;
}

export async function updateBalance(balance_dto: BalanceType) {
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

export interface IBalance {
	vk: string;
	balances?: UserBalancesType;
}

export async function handleTransfer(state: IKvp[]) {
	const balances_kvp = state.filter(
		(kvp) => kvp.key.split(".")[1].split(":")[0] === "balances"
	);
	console.log(balances_kvp);
	const transfers = balances_kvp.filter(
		(kvp) => kvp.key.split(":").length === 2
	);
	for (let kvp of transfers) {
		const { key, value } = kvp;
		const parts = key.split(".");
		const is_balance = parts[1].split(":")[0] === "balances" ? true : false;

		const vk = key.split(":")[1];
		const contract_name = parts[0];
		const amount = value.__fixed__ ? value.__fixed__ : value;
		console.log(contract_name, is_balance, vk);
		if (is_balance && vk && contract_name) {
			try {
				await updateBalance({ vk, contract_name, amount });
			} catch (err) {
				console.error(err);
			}
		}
	}
}
