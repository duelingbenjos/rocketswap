import { IKvp } from "src/types/misc.types";
import { getVal } from "../utils";
import { Entity, Column, BaseEntity, PrimaryGeneratedColumn } from "typeorm";

/** An instance of this entity is created after each time the buy / sell function is successfully called */

@Entity()
export class TradeHistoryEntity extends BaseEntity {
	@PrimaryGeneratedColumn()
	id: string;

	@Column()
	contract_name: string;

	@Column()
	price: string;

	@Column()
	time: string = Date.now().toString();

	@Column()
	amount: string;

	@Column()
	vk: string;

	@Column()
	type: 'buy' | 'sell' // buying or selling the token
}

export async function saveTradeUpdate(args: {
	contract_name: string;
	price: string;
	amount: string;
	vk: string;
	type: "buy" | "sell";
}) {
	const entity = new TradeHistoryEntity();
	for (let arg in args) {
		entity[arg] = args[arg];
	}
	await entity.save();
}
