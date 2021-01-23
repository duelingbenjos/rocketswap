import { IKvp } from "src/types/misc.types";
import { getVal, isLamdenKey } from "../utils";
import {
	Entity,
	Column,
	PrimaryColumn,
	BaseEntity,
	PrimaryGeneratedColumn
} from "typeorm";
import { handleClientUpdate, TradeUpdateType } from "src/types/websocket.types";
import { TokenEntity } from "./token.entity";
import { saveTradeUpdate } from "./trade-history.entity";

/** This entity is created when a new market is detected on the AMM contract. */

@Entity()
export class PairEntity extends BaseEntity {
	@PrimaryColumn()
	contract_name: string;

	@Column({ nullable: true })
	lp: string;

	@Column()
	time: string = Date.now().toString();

	@Column({ nullable: true })
	price: string;

	@Column({ nullable: true, type: "simple-json" })
	reserves: [string, string];
}

export async function saveReserves(
	fn: string,
	state: IKvp[],
	handleClientUpdate: handleClientUpdate
) {
	console.log(state);
	const reserve_kvp = state.find(
		(kvp) => kvp.key.split(".")[1].split(":")[0] === "reserves"
	);
	const price_kvp = state.find(
		(kvp) => kvp.key.split(".")[1].split(":")[0] === "prices"
	);
	const lp_kvp = state.find(
		(kvp) =>
			kvp.key.includes("lp_points") && kvp.key.split(":").length === 2
	);
	if (reserve_kvp) {
		let contract_name = reserve_kvp.key.split(":")[1];
		let vk_kvp = state.find((kvp) => {
			console.log(`${contract_name}.balances`);
			return (
				kvp.key.includes(`${contract_name}.balances`) &&
				isLamdenKey(kvp.key.split(":")[1])
			);
		});
		let vk = vk_kvp.key.split(":")[1];
		let old_currency_reserve: string;
		let old_token_reserve: string;
		let reserves: [string, string] = [
			reserve_kvp.value[0].__fixed__,
			reserve_kvp.value[1].__fixed__
		];
		let price = getVal(price_kvp);
		let lp = getVal(lp_kvp);

		let entity = await PairEntity.findOne(reserve_kvp.key.split(":")[1]);

		if (!entity) {
			entity = new PairEntity();
			entity.contract_name = contract_name;
			entity.reserves = reserves;
		} else {
			if (entity.reserves) {
				old_currency_reserve = entity.reserves[0];
				old_token_reserve = entity.reserves[1];
			}
			console.log(entity);
			if (fn === "buy") {
				let amount_exchanged = (
					parseFloat(old_token_reserve) - parseFloat(reserves[1])
				).toString();
				console.log(amount_exchanged);
				updateTradeFeed(
					contract_name,
					fn,
					amount_exchanged,
					handleClientUpdate
				);
				saveTradeUpdate({
					contract_name,
					type: fn,
					vk,
					amount: amount_exchanged,
					price
				});
			} else if (fn === "sell") {
				let amount_exchanged = (
					parseFloat(reserves[1]) - parseFloat(old_token_reserve)
				).toString();
				console.log(amount_exchanged);
				updateTradeFeed(
					contract_name,
					fn,
					amount_exchanged,
					handleClientUpdate
				);
				saveTradeUpdate({
					contract_name,
					type: fn,
					vk,
					amount: amount_exchanged,
					price
				});
			}
		}

		if (price_kvp) entity.price = price;
		if (lp_kvp) entity.lp = lp;
		if (reserves) entity.reserves = reserves;

		entity.time = Date.now().toString();
		await entity.save();

		handleClientUpdate({
			action: "metrics_update",
			contract_name,
			time: parseInt(entity.time),
			reserves: entity.reserves,
			lp: entity.lp,
			price: entity.price
		});
	}
}

function updateTradeFeed(
	token: string,
	type: "buy" | "sell",
	amount: string,
	handleClientUpdate: handleClientUpdate
) {
	const payload: TradeUpdateType = {
		action: "trade_update",
		type,
		amount,
		token
	};
	handleClientUpdate(payload);
}

export async function savePair(state: IKvp[]) {
	// { key: "con_amm2.pairs:con_token_test7", value: true },
	const pair_kvp = state.find(
		(kvp) => kvp.key.split(".")[1].split(":")[0] === "pairs"
	);
	if (!pair_kvp) return;
	const contract_name = pair_kvp.key.split(".")[1].split(":")[1];
	const pair_entity = new PairEntity();
	const token_entity = await TokenEntity.findOne({
		where: { contract_name }
	});
	if (token_entity) {
		token_entity.has_market = true;
		await token_entity.save();
	}
	pair_entity.contract_name = contract_name;
	if (contract_name === "con_token_bs") console.log(pair_entity);

	await pair_entity.save();
}

export async function savePairLp(state: IKvp[]) {
	const lp_kvp = state.find(
		(kvp) =>
			kvp.key.includes("lp_points") && kvp.key.split(":").length === 2
	);
	if (lp_kvp) {
		const parts = lp_kvp.key.split(".")[1].split(":");
		if (parts.length === 2) {
			const contract_name = parts[1];
			let entity = await PairEntity.findOne(contract_name);
			if (!entity) entity = new PairEntity();
			entity.contract_name = contract_name;
			entity.lp = getVal(lp_kvp);
			await entity.save();
		}
	}
}
