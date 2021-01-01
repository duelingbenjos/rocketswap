import { getVal, getContractName } from "../utils";
import {
	Entity,
	Column,
	PrimaryColumn,
	BaseEntity,
	PrimaryGeneratedColumn
} from "typeorm";
import { IKvp } from "../types/misc.types";

/** These are tokens added by watching the submission contract / submit_contract fn */

@Entity()
export class TokenEntity extends BaseEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	token_symbol: string;

	@Column()
	token_name: string;

	@Column({ nullable: true })
	base_supply: string;

	@Column()
	contract_name: string;

	@Column({ nullable: true })
	developer: string;

	@Column({ nullable: true })
	has_market: boolean;

	@Column({ nullable: true })
	logo_svg_base64: string;
}

export class AddTokenDto {
	token_symbol: string;
	token_name: string;
	base_supply: string;
	contract_name: string;
	token_seed_holder: string;
	developer: string;
	lp_info?: object;
	logo_svg_base64: string;
}

export const saveToken = async (add_token_dto: AddTokenDto) => {
	const {
		token_symbol,
		token_name,
		base_supply,
		contract_name,
		developer,
		logo_svg_base64
	} = add_token_dto;
	if (!token_symbol || !token_name || !base_supply || !contract_name)
		throw new Error("Field missing.");

	const exists = await TokenEntity.findOne(contract_name);
	if (exists) return

	const entity = new TokenEntity();
	entity.base_supply = base_supply;
	entity.token_symbol = token_symbol;
	entity.token_name = token_name;
	entity.contract_name = contract_name;
	entity.developer = developer;
	entity.logo_svg_base64 = logo_svg_base64;

	return await entity.save();
};

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
	const logo_svg_base64 = state.find(
		(kvp) => kvp.key === `${contract_name}.token_base64_svg`
	);
	const base_supply = supply_kvp.value;
	const token_seed_holder = supply_kvp.key.split(":")[1];
	return {
		contract_name,
		token_name,
		token_symbol,
		base_supply,
		token_seed_holder,
		developer,
		logo_svg_base64: logo_svg_base64?.value || null
	};
}

export async function updateLogo(state: IKvp[], contract_name: string){
	const logo_change = state.find(
		(kvp) => kvp.key.split(".")[1].split(":")[0] === "token_base64_svg"
	);
	if (!logo_change) return

	const tokenEntity = await TokenEntity.findOne({contract_name});
	if (!tokenEntity) return

	if(tokenEntity.logo_svg_base64 !== logo_change.value){
		tokenEntity.logo_svg_base64 = logo_change.value
		tokenEntity.save()
	}
}

export async function getTokenList(): Promise<string[]> {
	const tokens = await TokenEntity.find();
	return tokens.map((token) => token.contract_name);
}
