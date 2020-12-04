import { IKvp } from "src/types/misc.types";
import { getVal } from "../utils";
import { Entity, Column, BaseEntity, PrimaryGeneratedColumn } from "typeorm";

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

export async function savePrice(state: IKvp[]) {
	// [{ key: "con_amm2.prices:con_token_test7", value: { __fixed__: "1" } },]
	const price_kvp = state.find(
		(kvp) => kvp.key.split(".")[1].split(":")[0] === "prices"
	);
	if (!price_kvp) return;
	const entity = new PriceEntity();
	entity.contract_name = price_kvp.key.split(".")[1].split(":")[1];
	entity.price = getVal(price_kvp);
	await entity.save();
}
