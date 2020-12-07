import { IKvp } from "src/types/misc.types";
import { getVal } from "../utils";
import { Entity, Column, BaseEntity, PrimaryGeneratedColumn } from "typeorm";
import { Server } from "socket.io";
import { handleClientUpdate } from "src/types/websocket.types";

/** An instance of this entity is created after each action on the AMM that changes the price variable. */

@Entity()
export class PriceEntity extends BaseEntity {
	@PrimaryGeneratedColumn()
	id: string;

	@Column()
	contract_name: string;

	@Column()
	price: number;

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
	if (!price_kvp) return;
	const contract_name = price_kvp.key.split(".")[1].split(":")[1];
	const entity = new PriceEntity();
	const price = getVal(price_kvp);
	entity.contract_name = contract_name;
	entity.price = price;
	handleClientUpdate({
		action: "price_update",
		contract_name,
		price,
		time: parseInt(entity.time)
	});

	await entity.save();
}

export async function getPriceUpdate(contract_name: string) {
	const price_entity = await PriceEntity.findOneOrFail({
		where: { contract_name },
		order: {
			id: "DESC"
		}
	});
	console.log(price_entity);
	const { price, time } = price_entity;
	return { contract_name, price, time };
}
