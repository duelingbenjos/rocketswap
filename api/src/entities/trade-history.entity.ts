import { Entity, Column, BaseEntity, PrimaryGeneratedColumn } from "typeorm";

/** An instance of this entity is created after each time the buy / sell function is successfully called */

@Entity()
export class TradeHistoryEntity extends BaseEntity {
	@PrimaryGeneratedColumn()
	id: string;

	@Column()
	contract_name: string;

	@Column()
	token_symbol: string;

	@Column()
	price: string;

	@Column()
	time: number;

	@Column()
	amount: string;

	@Column()
	vk: string;

	@Column()
	type: "buy" | "sell"; // buying or selling the token

	@Column()
	hash: string;
}

export async function saveTradeUpdate(args: {
	contract_name: string;
	token_symbol: string;
	price: string;
	amount: string;
	vk: string;
	type: "buy" | "sell";
	time: number;
	hash;
}) {
	const entity = new TradeHistoryEntity();
	for (let arg in args) {
		entity[arg] = args[arg];
	}
	entity.time = args.time;
	await entity.save();
}
