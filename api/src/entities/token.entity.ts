import { getVal, getContractName } from "../utils";
import {
	Entity,
	Column,
	PrimaryColumn,
	BaseEntity,
	PrimaryGeneratedColumn
} from "typeorm";
import { IKvp } from "../types/misc.types";

@Entity()
export class TokenEntity extends BaseEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	token_symbol: string;

	@Column()
	token_name: string;

	@Column()
	base_supply: number;

	@Column()
	contract_name: string;

	@Column({ nullable: true })
	developer: string;
}

export class AddTokenDto {
	token_symbol: string;
	token_name: string;
	base_supply: number;
	contract_name: string;
	token_seed_holder: string;
	developer: string;
}

export const processAddToken = async (add_token_dto: AddTokenDto) => {
	const {
		token_symbol,
		token_name,
		base_supply,
		contract_name,
		developer
	} = add_token_dto;
	if (!token_symbol || !token_name || !base_supply || !contract_name)
		throw new Error("Field missing.");

	const exists = await TokenEntity.findOne(contract_name)
	if (exists) return
	const entity = new TokenEntity()
	entity.base_supply = base_supply;
	entity.token_symbol = token_symbol;
	entity.token_name = token_name;
	entity.contract_name = contract_name;
	entity.developer = developer;
	return await entity.save();
};

// export function prepareAddToken(state: IKvp[]): AddTokenDto {
// 	const contract_name = getContractName(state);
// 	const token_symbol = getVal(state, 1);
// 	const token_name = getVal(state, 0);
// 	const base_supply = getVal(state, 2);
// 	return { contract_name, token_name, token_symbol, base_supply };
// }

export function prepareAddToken(state: IKvp[]): AddTokenDto {
	const contract_name = getContractName(state);
	const token_symbol = state.find(
		(kvp) => kvp.key === `${contract_name}.token_symbol`
	).value;
	const token_name = state.find(
		(kvp) => kvp.key === `${contract_name}.token_name`
	).value;
	const developer = state.find(
		(kvp) => kvp.key === `${contract_name}.__developer__`
	).value;
	const supply_kvp = state.find((kvp) =>
		kvp.key.includes(`${contract_name}.balances`)
	);
	const base_supply = supply_kvp.value;
	const token_seed_holder = supply_kvp.key.split(":")[1];
	return {
		contract_name,
		token_name,
		token_symbol,
		base_supply,
		token_seed_holder,
		developer
	};
}

export async function getTokenList(): Promise<string[]> {
	const tokens = await TokenEntity.find();
	return tokens.map((token) => token.contract_name);
}
