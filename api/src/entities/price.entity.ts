import { IKvp } from "src/types/misc.types";
import { getVal } from "../utils";
import { Entity, Column, BaseEntity, PrimaryGeneratedColumn } from "typeorm";
import { Server } from "socket.io";
import {
	handleClientUpdate,
	MetricsUpdateType
} from "src/types/websocket.types";
import { PairEntity } from "./pair.entity";

/** An instance of this entity is created after each action on the AMM that changes the price variable. */

@Entity()
export class PriceEntity extends BaseEntity {
	@PrimaryGeneratedColumn()
	id: string;

	@Column()
	contract_name: string;

	@Column()
	price: string;

	@Column()
	time: string = Date.now().toString();
}

export async function savePrice(
	state: IKvp[],
	handleClientUpdate: handleClientUpdate
) {
	// [{ key: "con_amm2.prices:con_token_test7", value: { __fixed__: "1" } },]
	const price_kvp = state.find(
		(kvp) => kvp.key.split(".")[1].split(":")[0] === "prices"
	);
	//console.log(price_kvp)
	if (!price_kvp) return;
	const contract_name = price_kvp.key.split(".")[1].split(":")[1];

	const price_entity = new PriceEntity();
	const price = getVal(price_kvp);

	price_entity.contract_name = contract_name;
	price_entity.price = price;

	const pair_entity = await PairEntity.findOne(contract_name);

	pair_entity.price = price;
	const { lp, reserves } = pair_entity;

	handleClientUpdate({
		action: "metrics_update",
		contract_name,
		price,
		time: parseInt(price_entity.time),
		lp,
		reserves
	});

	await Promise.all([price_entity.save(), pair_entity.save()]);
}

export async function getTokenMetrics(contract_name: string) {
	const pair_entity = await PairEntity.findOneOrFail({
		where: { contract_name }
		// order: {
		// 	id: "DESC"
		// }
	});
	//console.log(pair_entity);
	const { price, time, lp, reserves } = pair_entity;
	return { contract_name, price, time: parseInt(time), reserves, lp };
}
