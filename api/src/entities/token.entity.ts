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

	@Column({nullable: true})
	token_symbol: string;

	@Column({nullable: true})
	token_name: string;

	@Column({ nullable: true })
	base_supply: string;

	@Column()
	contract_name: string;

	@Column({ nullable: true })
	developer: string;
	
	@Column({ nullable: true })
	owner: string;

	@Column({ nullable: true })
	has_market: boolean;

	@Column({ nullable: true })
	token_base64_svg: string;

	@Column({ nullable: true })
	token_base64_png: string;

	@Column({ nullable: true })
	token_logo_url: string;
}

export class AddTokenDto {
	token_symbol: string;
	token_name: string;
	base_supply: string;
	contract_name: string;
	token_seed_holder: string;
	developer: string;
	token_base64_svg?: string;
	token_base64_png?: string;
	token_logo_url?: string;
	owner?: string
}

export const saveToken = async (add_token_dto: AddTokenDto) => {
	const {
		token_symbol,
		token_name,
		base_supply,
		contract_name,
		developer,
		token_base64_svg,
		token_base64_png,
		token_logo_url,
		owner
	} = add_token_dto;
	if (!base_supply || !contract_name)
		throw new Error("Field missing.");

	const exists = await TokenEntity.findOne({contract_name});
	if (exists) return

	const entity = new TokenEntity();
	entity.base_supply = base_supply;
	entity.token_symbol = token_symbol;
	entity.token_name = token_name;
	entity.contract_name = contract_name;
	entity.developer = developer;
	entity.owner = owner;
	entity.token_base64_svg = token_base64_svg;
	entity.token_base64_png = token_base64_png;
	entity.token_logo_url = token_logo_url;

	return await entity.save();
};

export function prepareAddToken(state: IKvp[]): AddTokenDto {
	const contract_name = getContractName(state);
	const token_symbol = state.find(
		(kvp) => kvp.key === `${contract_name}.metadata:token_symbol`
	)?.value || '';
	const token_name = state.find(
		(kvp) => kvp.key === `${contract_name}.metadata:token_name`
	)?.value || '';
	const developer = state.find(
		(kvp) => kvp.key === `${contract_name}.__developer__`
	).value;
	const owner = state.find(
		(kvp) => kvp.key === `${contract_name}.__owner__`
	)?.value || "";
	const supply_kvp = state.find((kvp) =>
		kvp.key.includes(`${contract_name}.balances`)
	);
	const token_base64_svg = state.find(
		(kvp) => kvp.key === `${contract_name}.metadata:token_logo_base64_svg`
	)?.value || '';
	const token_base64_png = state.find(
		(kvp) => kvp.key === `${contract_name}.metadata:token_logo_base64_png`
	)?.value || '';
	const token_logo_url = state.find(
		(kvp) => kvp.key === `${contract_name}.metadata:token_logo_url`
	)?.value || '';

	const base_supply = supply_kvp.value;
	const token_seed_holder = supply_kvp.key.split(":")[1];
	return {
		contract_name,
		token_name,
		token_symbol,
		base_supply,
		token_seed_holder,
		developer,
		token_base64_svg,
		token_base64_png,
		token_logo_url,
		owner
	};
}

export async function saveTokenUpdate(state: IKvp[]) {
	state.forEach(async (change) => {
		let contract_name = change.key.split(".")[0]
		const entity = await TokenEntity.findOne({contract_name})
		if (entity){
			if (change.key.includes(".metadata:token_logo_base64_svg")) entity.token_base64_svg = change.value
			if (change.key.includes(".metadata:token_logo_base64_png")) entity.token_base64_png = change.value
			if (change.key.includes(".metadata:token_logo_url")) entity.token_logo_url = change.value
			if (change.key.includes(".metadata:token_symbol")) entity.token_symbol = change.value
			if (change.key.includes(".metadata:token_name")) entity.token_name = change.value
			try{
				await entity.save()
			}catch (err) {
				console.error(err)
			}
		}
	})
}

export async function getTokenList(): Promise<string[]> {
	const tokens = await TokenEntity.find();
	return tokens.map((token) => token.contract_name);
}
