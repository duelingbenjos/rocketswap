import { IKvp } from "src/types/misc.types";
import { getVal, isLamdenKey } from "../utils";
import {
	Entity,
	Column,
	PrimaryColumn,
	BaseEntity,
	PrimaryGeneratedColumn
} from "typeorm";
import { handleClientUpdateType, TradeUpdateType } from "src/types/websocket.types";
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

	@Column({ nullable: true })
	token_symbol: string;

	@Column({ nullable: true, type: "simple-json" })
	reserves: [string, string];
}

export async function saveReserves(
	fn: string,
	state: IKvp[],
	handleClientUpdate: handleClientUpdateType,
	timestamp: number,
	hash: string
) {
	// console.log(state);
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
		// console.log(reserve_kvp)
		let contract_name = reserve_kvp.key.split(":")[1];
		console.log(state)
		let vk_kvp = state.find((kvp) => {
			console.log(kvp.key)
			// console.log(`${contract_name}.balances`);
			return (
				kvp.key.includes(`${contract_name}.balances`) &&
				isLamdenKey(kvp.key.split(":")[1])
			);
		});
		let vk = 'vk_kvp.key.split(":")[1];'
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
			// console.log(entity);
			if (fn === "buy" || fn === "sell") {
				let amount_exchanged = getAmountExchanged(fn, old_token_reserve, reserves);

				updateTradeFeed({
					contract_name,
					token_symbol: entity.token_symbol,
					type: fn,
					amount: amount_exchanged,
					price,
					handleClientUpdate,
					time: timestamp,
					hash
				});
				saveTradeUpdate({
					contract_name,
					token_symbol: entity.token_symbol,
					type: fn,
					vk,
					amount: amount_exchanged,
					price,
					time: timestamp,
					hash
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

const getAmountExchanged = (
	fn: string,
	old_token_reserve: any,
	reserves: any[]
) => {
	return fn === "buy"
		? (parseFloat(old_token_reserve) - parseFloat(reserves[1])).toString()
		: (parseFloat(reserves[1]) - parseFloat(old_token_reserve)).toString();
};

function updateTradeFeed(args: {
	contract_name: string;
	token_symbol: string;
	type: "buy" | "sell";
	amount: string;
	price: string;
	handleClientUpdate: handleClientUpdateType;
	time: number;
	hash: string
}) {
	const {
		type,
		amount,
		contract_name,
		token_symbol,
		price,
		handleClientUpdate,
		time,
		hash
	} = args;

	const payload: TradeUpdateType = {
		action: "trade_update",
		type,
		amount,
		contract_name,
		token_symbol,
		price,
		time,
		hash
	};
	handleClientUpdate(payload);
}

export async function savePair(state: IKvp[]) {
	// console.log(state)
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
		pair_entity.token_symbol = token_entity.token_symbol;
	}
	pair_entity.contract_name = contract_name;
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
