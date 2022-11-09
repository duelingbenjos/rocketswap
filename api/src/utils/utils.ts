import { IKvp } from "../types/misc.types";
import BigNumber from "bignumber.js";
import { TokenEntity } from "../entities/token.entity";
import { log } from "./logger";
import { config } from "../config";
import { BalanceEntity } from "../entities/balance.entity";
import { StakingMetaEntity } from "../entities/staking-meta.entity";
const Fs = require("fs");

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
	if (!value) {
		return 0;
	} else if (Number(value)! === NaN) {
		// is
		return value;
	} else if (value.__fixed__) {
		return value.__fixed__;
	} else if (value.__hash_self__ || String(value.__hash_self__) === "0") {
		return value.__hash_self__.__fixed__ ? value.__hash_self__.__fixed__ : value.__hash_self__;
	} else if (Object.keys(value).length) {
		return 0;
	} else {
		return value;
	}
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

export function writeToFile(data, path) {
	const json = JSON.stringify(data, null, 2);

	Fs.writeFile(path, json, (err) => {
		if (err) {
			console.error(err);
			throw err;
		}

		console.log("Saved data to file.");
	});
}

export const getNumberFromFixed = (value: any) => (value.__fixed__ ? Number(value.__fixed__) : Number(value));

export const getVkFromKeys = (keys: string[]): string => {
	const k = keys.find((k) => {
		let vk = k.split(":")[1];
		return vk.length === 64;
	});
	return k.split(":")[1];
};

export async function calcRswpCirculating() {
	// Get all RSWP balances
	const rswp_balances = (await BalanceEntity.find())?.map((b) => {
		return { vk: b.vk, rswp_balance: Number(b.balances?.con_rswp_lst001) || 0 };
	});

	const total_balance = rswp_balances.reduce((accum, b) => {
		return accum + b.rswp_balance;
	}, 0);

	const out_of_circulation = [
		"fcefe7743fa70c97ae2d5290fd673070da4b0293da095f0ae8aceccf5e62b6a1",
		"con_liq_mining_rswp_rswp",
		"burn",
		"con_simple_staking_tau_rswp_01",
		"con_simple_staking_tau_rswp_001"
	];
	const rswp_rswp_staking_contracts = ["con_staking_rswp_interop", "con_staking_rswp_rswp", "con_staking_rswp_rswp_interop_v2"];

	const undistributed_from_rswp_rswp = await getUndistributed(rswp_rswp_staking_contracts, rswp_balances);

	const custodians_balance = rswp_balances
		.filter((b) => out_of_circulation.includes(b.vk))
		.reduce((accum, b) => {
			return (accum += b.rswp_balance);
		}, 0);

	const total = total_balance - custodians_balance - undistributed_from_rswp_rswp;
	
	log.log(total);
}

async function getUndistributed(contract_names: string[], rswp_balances: IRswpBalances[]) {
	let undistributed = 0;
	for (let c of contract_names) {
		const this_balance = rswp_balances.find((b) => b.vk === c)?.rswp_balance;
		const ent = await StakingMetaEntity.findOne({ where: { contract_name: c } });
		const { StakedBalance } = ent;
		const excess = this_balance - StakedBalance;
		undistributed += excess > 0 ? excess : 0;
	}
	return undistributed;
}

interface IRswpBalances {
	vk: string;
	rswp_balance: number;
}
