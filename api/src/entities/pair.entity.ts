import { IKvp } from "src/types/misc.types";
import { getVal } from "../utils";
import {
	Entity,
	Column,
	PrimaryColumn,
	BaseEntity,
	PrimaryGeneratedColumn
} from "typeorm";

/** This entity is created when a new market is detected on the AMM contract. */

@Entity()
export class PairEntity extends BaseEntity {
	@PrimaryColumn()
	contract_name: string;

	@Column({ nullable: true })
	lp: number;

	@Column()
	time: string = Date.now().toString();

	@Column({ nullable: true, type: "simple-json" })
	reserves: [number, number];
}

export async function saveReserves(state: IKvp[]) {
	//    [ {key: "con_amm2.reserves:con_token_test7", value: [{ __fixed__: "100.0" }, { __fixed__: "100.0" }]},]
	const reserve_kvp = state.find(
		(kvp) => kvp.key.split(".")[1].split(":")[0] === "reserves"
	);
	if (reserve_kvp) {
		let contract_name = reserve_kvp.key.split(".")[0];
		let entity = await PairEntity.findOne(reserve_kvp.key.split(":")[1]);
		if (!entity) {
			entity = new PairEntity();
			entity.contract_name = contract_name;
		}
		const values: [number, number] = [
			reserve_kvp.value[0].__fixed__,
			reserve_kvp.value[1].__fixed__
		];
		entity.reserves = values;
		await entity.save();
	}
}

export async function savePair(state: IKvp[]) {
	// { key: "con_amm2.pairs:con_token_test7", value: true },
	const pair_kvp = state.find(
		(kvp) => kvp.key.split(".")[1].split(":")[0] === "pairs"
	);
	if (!pair_kvp) return;
	const entity = new PairEntity();
	entity.contract_name = pair_kvp.key.split(".")[1].split(":")[1];
	await entity.save();
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
			console.log(parts);
			const contract_name = parts[1];
			let entity = await PairEntity.findOne(contract_name);
			if (!entity) entity = new PairEntity();
			entity.contract_name = contract_name;
			entity.lp = getVal(lp_kvp);
			console.log(lp_kvp);
			console.log(entity.lp);
			await entity.save();
		}
	}
}
