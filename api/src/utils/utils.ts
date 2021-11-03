import { IKvp } from "../types/misc.types";
import BigNumber from "bignumber.js";
import { TokenEntity } from "../entities/token.entity";
import { log } from "./logger";
import { config } from "../config";

const validators = require("types-validate-assert");
const { validateTypes } = validators;

export const isLamdenKey = (key) => {
	if (validateTypes.isStringHex(key) && key.length === 64) return true;
	return false;
};

export const getNewJoiner = (state, prev_state): string => {
	const { players } = state;
	const prev_players = prev_state.players;

	const new_joiner = players.reduce((accum, val) => {
		if (val.indexOf(prev_players) < 0) accum = val;
	}, "");
	return new_joiner;
};

/**
 * Contracts must have the following fields to be added to the watch list:
 * 'def transfer', 'def balance_of', 'def allowance' 'def approve', 'def transfer_from', 'token_name = Variable', 'token_symbol = Variable'
 */

export function validateTokenContract(contract: string): boolean {
	const required_fields = ["def transfer", "def approve", "def transfer_from"];
	let missing = required_fields.map((field) => contract.includes(field));
	let missing_idx = missing.findIndex((field) => field === false);
	return missing_idx > -1 ? false : true;
}

export const isValidStakingContract = (state: IKvp[], submitted_contract_name: string) => {
	let owner_is_staking_contract_submittor = state.find(
		(s) => s.key === `${submitted_contract_name}.Owner` && s.value === config.staking_contract_submittor
	);

	if (owner_is_staking_contract_submittor) {
		const code = getContractCode(state);
		return validateStakingContract(code);
	}
	return false;
};

export function validateStakingContract(contract: string): boolean {
	const required_fields = ["def addStakingTokens", "def withdrawTokensAndYield"];
	let missing = required_fields.map((field) => contract.includes(field));
	let missing_idx = missing.findIndex((field) => field === false);
	return missing_idx > -1 ? false : true;
}

export function getKey(state: IKvp[], idx_1: number, idx_2: number) {
	return state[idx_1].key.split(":")[idx_2];
}

/** Returns and parses a value */

export function getVal(state: IKvp[] | IKvp, idx?: number) {
	let val;
	if (idx) {
		val = state[idx]?.value;
	} else {
		val = (state as IKvp)?.value;
	}
	val = val?.__fixed__ || val;
	if (typeof val === "number") {
		return val.toString();
	} else {
		return val;
	}
}

export function getValue(value: any) {
	if (value.__fixed__) return value.__fixed__;
	else if (value.__hash_self__) return getValue(value.__hash_self__);
	return value;
}

export function getNumber(value: any) {
	let return_val = value.__fixed__ ? Number(value.__fixed__) : Number(value);
	return return_val;
}

export function getContractName(state: IKvp[]) {
	let code_entry = getContractEntry(state);
	if (code_entry) {
		let code_key = code_entry.key;
		let contract_name = code_key.split(".")[0];
		return contract_name;
	}
	return "";
}

export function getContractEntry(state: IKvp[]) {
	let code_entry = state.filter((kvp) => {
		return kvp.key.includes("__code__");
	})[0];
	return code_entry;
}

export function getContractCode(state: IKvp[]) {
	let entry = getContractEntry(state);
	return entry ? entry.value : "";
}

export function decideLogo(token: TokenEntity): { type: string; data: string } {
	/**
	 * Returns an image in this order of preference
	 * 1. SVG
	 * 2. PNG
	 * 3. URL
	 */
	let obj = {
		type: "",
		data: ""
	};
	if (token.token_base64_svg) {
		(obj.type = "svg"), (obj.data = token.token_base64_svg);
	} else if (token.token_base64_png) {
		(obj.type = "png"), (obj.data = token.token_base64_png);
	} else {
		obj.type = "url";
		obj.data = token.token_logo_url;
	}

	return obj;
}

export function dateNowUtc() {
	const minute_difference = new Date().getTimezoneOffset();
	if (minute_difference !== 0) {
		let difference_ms = minute_difference * 60 * 1000;
		return Date.now() + difference_ms;
	}
	return Date.now();
}

export const arrFromStr = (str: string, delimiter: string = ","): string[] => str.split(delimiter);
