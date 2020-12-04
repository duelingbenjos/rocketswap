import { IKvp } from "src/types/misc.types";
import { Entity, Column, PrimaryColumn, BaseEntity } from "typeorm";

@Entity()
export class BalanceEntity extends BaseEntity implements IBalance {
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

export interface IBalance {
	vk: string;
	balances?: UserBalancesType;
}

export async function handleTransfer(state: IKvp[]) {
	[
		{
			key:
				"con_token_test_coin.balances:f8a429afc20727902fa9503f5ecccc9b40cfcef5bcba05204c19e44423e65def",
			value: { __fixed__: "99000000.0" }
		},
		{
			key:
				"con_token_test_coin.balances:1c3b4e62b9a8315b93bdf3027728797257820d05bdce0551eaca8ca2472126a3",
			value: { __fixed__: "1000000.0" }
		},
		{
			key:
				"currency.balances:f8a429afc20727902fa9503f5ecccc9b40cfcef5bcba05204c19e44423e65def",
			value: { __fixed__: "4978.70630000" }
		}
	];

	const proms = [];
	for (let kvp of state) {
		const { key, value } = kvp;
		const parts = key.split(".");
		const is_balance = parts[1].split(":")[0] === "balances" ? true : false;

		const vk = key.split(":")[1];
		const contract_name = parts[0];
		const amount = value.__fixed__ ? value.__fixed__ : value;
		console.log(contract_name, is_balance, vk);
		if (is_balance && vk && contract_name) {
			proms.push(updateUserBalance({ vk, contract_name, amount }));
		}
	}
	try {
		console.log(proms.length);
		await Promise.all(proms);
	} catch (err) {
		console.error(err);
	}
}
