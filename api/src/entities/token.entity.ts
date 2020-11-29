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
}

export class AddTokenDto {
	token_symbol: string;
	token_name: string;
	base_supply: number;
	contract_name: string;
}

export const processAddToken = async (add_token_dto: AddTokenDto) => {
	const {
		token_symbol,
		token_name,
		base_supply,
		contract_name
	} = add_token_dto;
	if (!token_symbol || !token_name || !base_supply || !contract_name)
		throw Error("Field missing.");

	let entity = new TokenEntity();
	entity.base_supply = base_supply;
	entity.token_symbol = token_symbol;
	entity.token_name = token_name;
	entity.contract_name = contract_name;
	return await entity.save();
};

export function prepareAddToken(state: IKvp[]): AddTokenDto {
	const contract_name = getContractName(state);
	const token_symbol = getVal(state, 1);
	const token_name = getVal(state, 0);
	const base_supply = getVal(state, 2);
	return { contract_name, token_name, token_symbol, base_supply };
}
