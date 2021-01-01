import { IKvp } from "./types/misc.types";
import BigNumber from "bignumber.js";

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
	const required_fields = [
		"def transfer",
		"def balance_of",
		"def allowance",
		"def approve",
		"def transfer_from",
		"token_name = Variable",
		"token_symbol = Variable"
	];
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
	val = new BigNumber(val?.__fixed__ || val)
	if (val.isNaN()) return "0"
	return val.toString()
}

export function getContractName(state: IKvp[]) {
	let code_entry = getContractEntry(state);
	//console.log(code_entry);
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
