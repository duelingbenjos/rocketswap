import { arrFromStr, getContractName } from "../utils/utils";
import { Entity, Column, BaseEntity, PrimaryGeneratedColumn } from "typeorm";
import { IKvp } from "../types/misc.types";
import { log } from "../utils/logger";

/** These are tokens added by watching the submission contract / submit_contract fn */

@Entity()
export class TokenEntity extends BaseEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ nullable: true })
	token_symbol: string;

	@Column({ nullable: true })
	token_name: string;

	@Column({ nullable: true })
	base_supply: string;

	@Column()
	contract_name: string;

	@Column({ nullable: true })
	developer: string;

	@Column({ nullable: true })
	operator: string;

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
	operator?: string;
	custodian_addresses?: string[];
	burn_addresses?: string[];
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
		operator
	} = add_token_dto;
	if (!contract_name) {
		throw new Error("Field missing.");
	}

	const exists = await TokenEntity.findOne({ contract_name });
	if (exists) return;

	const entity = new TokenEntity();
	entity.base_supply = base_supply;
	entity.token_symbol = token_symbol ? await decideSymbol(token_symbol) : token_symbol;
	entity.token_name = token_name;
	entity.contract_name = contract_name;
	entity.developer = developer;
	entity.operator = operator;
	entity.token_base64_svg = token_base64_svg;
	entity.token_base64_png = token_base64_png;
	entity.token_logo_url = token_logo_url;
	return await entity.save();
};

async function decideSymbol(token_symbol: string): Promise<string> {
	const symbol_entity = await TokenEntity.findOne({ where: { token_symbol } });

	if (symbol_entity) {
		const parts = token_symbol.split("_");
		let idx = parts[1];
		let new_idx;
		if (idx) {
			if (parseInt(idx) > -1) {
				new_idx = parseInt(idx) + 1;
			}
		} else {
			new_idx = 1;
		}
		return await decideSymbol(`${parts[0]}_${new_idx}`);
	}
	return token_symbol;
}

export function prepareAddToken(state: IKvp[]): AddTokenDto {
	const contract_name = getContractName(state);
	const token_symbol = state.find((kvp) => kvp.key === `${contract_name}.metadata:token_symbol`)?.value || "";
	const token_name = state.find((kvp) => kvp.key === `${contract_name}.metadata:token_name`)?.value || "";
	const developer = state.find((kvp) => kvp.key === `${contract_name}.__developer__`).value;
	const operator = state.find((kvp) => kvp.key === `${contract_name}.metadata.operator`)?.value || "";
	const supply_kvp = state.find((kvp) => kvp.key.includes(`${contract_name}.balances`));
	const token_base64_svg = state.find((kvp) => kvp.key === `${contract_name}.metadata:token_logo_base64_svg`)?.value || "";
	const token_base64_png = state.find((kvp) => kvp.key === `${contract_name}.metadata:token_logo_base64_png`)?.value || "";
	const token_logo_url = state.find((kvp) => kvp.key === `${contract_name}.metadata:token_logo_url`)?.value || "";

	const burn_addresses_raw = state.find((kvp) => kvp.key === `${contract_name}.metadata:burn_addresses`)?.value || "";
	const custodian_addresses_raw = state.find((kvp) => kvp.key === `${contract_name}.metadata:custodian_addresses`)?.value || "";

	const burn_addresses = burn_addresses_raw ? arrFromStr(burn_addresses_raw) : [];
	const custodian_addresses = custodian_addresses_raw ? arrFromStr(custodian_addresses_raw) : [];

	const base_supply = supply_kvp?.value;
	const token_seed_holder = supply_kvp?.key.split(":")[1];
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
		operator,
		custodian_addresses,
		burn_addresses
	};
}

export async function saveTokenUpdate(state: IKvp[]) {
	let contract_name = state[0].key.split(".")[0];
	const entity = await TokenEntity.findOne({ contract_name });
	state.forEach(async (change) => {
		if (entity) {
			if (change.key.includes(".metadata:token_logo_base64_svg")) entity.token_base64_svg = change.value;
			if (change.key.includes(".metadata:token_logo_base64_png")) entity.token_base64_png = change.value;
			if (change.key.includes(".metadata:token_logo_url")) entity.token_logo_url = change.value;
			if (change.key.includes(".metadata:token_symbol")) entity.token_symbol = change.value;
			if (change.key.includes(".metadata:token_name")) entity.token_name = change.value;
			try {
				await entity.save();
			} catch (err) {
				console.error(err);
			}
		}
	});
}

export async function getTokenList(): Promise<string[]> {
	const tokens = await TokenEntity.find();
	return tokens.map((token) => token.contract_name);
}

/** STUB */

export const getBaseSupply = () => {
	return "0";
};

export const getTokenData = (state, contract_name: string): { token: AddTokenDto; balances: any } => {
	let { __developer__: developer, __owner__: owner, balances, metadata } = state;

	if (!metadata) metadata = {};

	/** Process Metadata if it exists */
	const {
		operator,
		token_logo_base64_svg,
		token_logo_base64_png,
		token_logo_url,
		token_symbol,
		token_name,
		custodian_addresses,
		burn_addresses
	} = metadata;
	const token: AddTokenDto = {
		developer,
		operator,
		token_base64_png: token_logo_base64_png?.__hash_self__ ? token_logo_base64_png?.__hash_self__ : token_logo_base64_png,
		token_base64_svg: token_logo_base64_svg?.__hash_self__ ? token_logo_base64_svg?.__hash_self__ : token_logo_base64_svg,
		token_logo_url,
		base_supply: getBaseSupply(),
		token_symbol: token_symbol || '',
		token_name: token_name || '',
		contract_name,
		token_seed_holder: developer,
		custodian_addresses: arrFromStr(custodian_addresses || "", ","),
		burn_addresses: arrFromStr(burn_addresses || "", ",")
	};
	return { token, balances };
};
