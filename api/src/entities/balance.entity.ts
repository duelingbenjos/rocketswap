import { IKvp } from "../types/misc.types";
import { getVal } from "../utils/utils";
import { Entity, Column, PrimaryColumn, BaseEntity } from "typeorm";
import { handleClientUpdateType } from "../types/websocket.types";

/** Updated when the token balance from one of the token contracts the API detects has a change. */

@Entity()
export class BalanceEntity extends BaseEntity implements IBalance {
	@PrimaryColumn()
	vk: string;

	@Column({ type: "simple-json" })
	balances: UserBalancesType;
}

export async function updateBalance(balance_dto: BalanceType) {
	let { contract_name, amount, vk } = balance_dto;
	if (typeof amount === "number") amount = (amount as number).toString();
	let entity = await BalanceEntity.findOne({ where: { vk } });
	if (!entity) {
		entity = new BalanceEntity();
		entity.vk = vk;
		entity.balances = {};
	}
	entity.balances[contract_name] = amount;
	const res = await entity.save();
	return res;
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

export async function saveTransfer(args: {
	state: IKvp[];
	handleClientUpdate: handleClientUpdateType;
}) {
	const { state, handleClientUpdate } = args;
	const balances_kvp = state.filter(
		(kvp) => kvp.key.split(".")[1].split(":")[0] === "balances"
	);
	const balance_updates = balances_kvp.filter(
		(kvp) => kvp.key.split(":").length === 2
	);
	for (let kvp of balance_updates) {
		const { key, value } = kvp;
		const parts = key.split(".");
		const is_balance = parts[1].split(":")[0] === "balances" ? true : false;

		const vk = key.split(":")[1];
		const contract_name = parts[0];
		const amount = getVal(kvp);
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
