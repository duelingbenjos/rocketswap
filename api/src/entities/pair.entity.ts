import { IKvp } from "src/types/misc.types";
import { getVal } from "../utils";
import {
	Entity,
	Column,
	PrimaryColumn,
	BaseEntity,
	PrimaryGeneratedColumn
} from "typeorm";
import { handleClientUpdate } from "src/types/websocket.types";
import { TokenEntity } from "./token.entity";

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
	state: IKvp[],
	handleClientUpdate: handleClientUpdate
) {
	//    [ {key: "con_amm2.reserves:con_token_test7", value: [{ __fixed__: "100.0" }, { __fixed__: "100.0" }]},]
	const reserve_kvp = state.find(
		(kvp) => kvp.key.split(".")[1].split(":")[0] === "reserves"
	);
	const price_kvp = state.find(
		(kvp) => kvp.key.split(".")[1].split(":")[0] === "prices"
	);
	const lp_kvp = state.find(
		(kvp) => kvp.key.includes("lp_points") && kvp.key.split(":").length === 2
	);
	if (reserve_kvp) {
		let contract_name = reserve_kvp.key.split(".")[0];
		let entity = await PairEntity.findOne(reserve_kvp.key.split(":")[1]);
		if (!entity) {
			entity = new PairEntity();
			entity.contract_name = contract_name;
		}
		let reserves: [string, string] = [
			reserve_kvp.value[0].__fixed__,
			reserve_kvp.value[1].__fixed__
		];

		if (price_kvp) entity.price = getVal(price_kvp);
		if (lp_kvp) entity.lp = getVal(lp_kvp);
		if (reserves) entity.reserves = reserves;

		entity.time = Date.now().toString();
		handleClientUpdate({
			action: "metrics_update",
			contract_name,
			time: parseInt(entity.time),
			reserves: entity.reserves,
			lp: entity.lp,
			price: entity.price
		});
		await entity.save();
	}
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
	if (contract_name === "con_token_bs") console.log(pair_entity)
	
	await pair_entity.save();
}

export async function savePairLp(state: IKvp[]) {
	// { key: "con_amm2.lp_points:con_token_test7", value: 100 }
	const lp_kvp = state.find(
		(kvp) =>
			kvp.key.includes("lp_points") && kvp.key.split(":").length === 2
	);
	if (lp_kvp) {
		const parts = lp_kvp.key.split(".")[1].split(":");
		if (parts.length === 2) {
			//console.log(parts);
			const contract_name = parts[1];
			let entity = await PairEntity.findOne(contract_name);
			if (!entity) entity = new PairEntity();
			entity.contract_name = contract_name;
			entity.lp = getVal(lp_kvp);
			//console.log(lp_kvp);
			//console.log(entity.lp);
			await entity.save();
		}
	}
}
