import { IKvp } from "../types/misc.types";
import BigNumber from "bignumber.js";
import { getVal } from "../utils";
import { Entity, Column, PrimaryColumn, BaseEntity } from "typeorm";
import { handleClientUpdate } from "../types/websocket.types";

/** Updated when the token balance from one of the token contracts the API detects has a change. */

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
	[key: string]: string;
};

export type BalanceType = {
	contract_name: string;
	vk: string;
	amount: string;
};

export interface IBalance {
	vk: string;
	balances?: UserBalancesType;
}

export async function saveTransfer(
	state: IKvp[],
	handleClientUpdate: handleClientUpdate
) {
	const balances_kvp = state.filter(
		(kvp) => kvp.key.split(".")[1].split(":")[0] === "balances"
	);
	//console.log(balances_kvp);
	const transfers = balances_kvp.filter(
		(kvp) => kvp.key.split(":").length === 2
	);
	for (let kvp of transfers) {
		const { key, value } = kvp;
		const parts = key.split(".");
		const is_balance = parts[1].split(":")[0] === "balances" ? true : false;

		const vk = key.split(":")[1];
		const contract_name = parts[0];
		//console.log(getVal(kvp))
		const amount = getVal(kvp);
		//console.log(contract_name, is_balance, vk);
		if (is_balance && vk && contract_name) {
			try {
				const res = await updateBalance({ vk, contract_name, amount });
				handleClientUpdate({
					action: "balance_update",
					payload: res
				});
			} catch (err) {
				console.error(err);
			}
		}
	}
}
