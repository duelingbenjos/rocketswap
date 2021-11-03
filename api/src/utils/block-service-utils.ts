import { config } from "../config";
// import { findMostRecentTradeFromDb, syncHistoryToDb } from '../db/trade-entity';
import { BlockService } from "../services/block.service";
import { log } from "./logger";
import { validateTokenContract } from "./utils";

const axiosDefaultConfig = {
	proxy: false
};

const axios = require("axios").create(axiosDefaultConfig);

export const examineTxState = (history: any[]) => {
	const price_affected = history.filter((hist) => hist.state_changes_obj?.con_rocketswap_official_v1_1?.prices);
	const methods = {};
	price_affected.forEach((hist) => {
		const tx_type = hist.txInfo.transaction.payload.function;
		if (!methods[tx_type]) {
			methods[tx_type] = 1;
		} else methods[tx_type]++;
	});
	const last_tx = price_affected[price_affected.length - 1];
	const last_tx_time = new Date(last_tx.txInfo.transaction.metadata.timestamp * 1000);
};

export const getVariableChanges = async (contractName: string, variableName: string, last_tx_uid: string | number, limit: number = 10) => {
	let endpoint = "variable_history";
	let query = [`contract=${contractName}`, `variable=${variableName}`, `last_tx_uid=${last_tx_uid}`, `limit=${limit}`].join("&");
	let res = await axios.get(`http://${BlockService.get_block_service_url()}/${endpoint}?${query}`);
	return res.data;
};

export const getCurrentKeyValue = async (contractName: string, variableName: string, key: string) => {
	try {
		let endpoint = "current/one";
		let res = await axios(`http://${BlockService.get_block_service_url()}/${endpoint}/${contractName}/${variableName}/${key}`);
		return res.data;
	} catch (e) {
		return e;
	}
};

export const getContractChanges = async (contractName: string, last_tx_uid: string, limit: number = 10) => {
	let endpoint = "contract_history";
	let query = [`contract=${contractName}`, `last_tx_uid=${last_tx_uid}`, `limit=${limit}`].join("&");
	let res = await axios(`http://${BlockService.get_block_service_url()}/${endpoint}?${query}`);
	return res.data;
};

export const getContractState = async (contractName: string) => {
	try {
		log.log("GET CONTRACT STATE CALLED");
		log.log(BlockService.get_block_service_url());
		let endpoint = "current/all";
		const url = `http://${BlockService.get_block_service_url()}/${endpoint}/${contractName}`;
		let res = await axios(url);
		return res.data;
	} catch (err) {
		log.warn(err);
	}
};

export const getRootKeyChanges = async (args: {
	contractName: string;
	variableName: string;
	root_key: string;
	last_tx_uid: number | string;
	limit: number;
}) => {
	try {
		const { contractName, variableName, root_key, last_tx_uid, limit } = args;
		let endpoint = "rootkey_history";
		let query = [
			`contract=${contractName}`,
			`variable=${variableName}`,
			`root_key=${root_key}`,
			`last_tx_uid=${last_tx_uid}`,
			`limit=${limit}`
		].join("&");
		let res = await axios.get(`http://${BlockService.get_block_service_url()}/${endpoint}?${query}`);
		return res.data;
	} catch (err) {
		log.warn(err);
	}
};

export const getNumberFromFixed = (value: any) => (value.__fixed__ ? Number(value.__fixed__) : Number(value));

export const getAllContracts = async () => {
	const res = await axios.get(`http://${BlockService.get_block_service_url()}/contracts`);
	return res.data;
};

export const getContractSource = async (contract_name: string) => {
	// http://165.227.181.34:3535/current/one/con_bdt_lst001/__code__
	const endpoint = "current/one";
	const res = await axios.get(`http://${BlockService.get_block_service_url()}/${endpoint}/${contract_name}/__code__`);
	return res.data;
};

export const prepareAndAddToken = async (contract_name: string) => {
	const state = await getContractState(contract_name);
	const metadata = getTokenData(state);
};

export const getTokenData = (state) => {
	// const token_symbol = state.find((kvp) => kvp.key === `${contract_name}.metadata:token_symbol`)?.value || "";
	// const token_name = state.find((kvp) => kvp.key === `${contract_name}.metadata:token_name`)?.value || "";
	// const developer = state.find((kvp) => kvp.key === `${contract_name}.__developer__`).value;
	// const operator = state.find((kvp) => kvp.key === `${contract_name}.metadata.operator`)?.value || "";
	// const supply_kvp = state.find((kvp) => kvp.key.includes(`${contract_name}.balances`));
	// const token_base64_svg = state.find((kvp) => kvp.key === `${contract_name}.metadata:token_logo_base64_svg`)?.value || "";
	// const token_base64_png = state.find((kvp) => kvp.key === `${contract_name}.metadata:token_logo_base64_png`)?.value || "";
	// const token_logo_url = state.find((kvp) => kvp.key === `${contract_name}.metadata:token_logo_url`)?.value || "";

	// const burn_addresses_raw = state.find((kvp) => kvp.key === `${contract_name}.metadata:burn_addresses`)?.value || "";
	// const custodian_addresses_raw = state.find((kvp) => kvp.key === `${contract_name}.metadata:custodian_addresses`)?.value || "";
  const {__developer__, __owner__, balances, metadata} = state
  const {operator, owner, token_logo_base64_svg, token_logo_base64_png, token_logo_url, token_symbol, token_name} = metadata
	operator: "f16c130ceb7ed9bcebde301488cfd507717d5d511674bc269c39ad41fc15d780";
	owner: "con_lamden_link_bsc_v1";
	token_logo_base64_png: "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";
	token_name: "Block Duelers";
	token_symbol: "BDT";
	__developer__: "f16c130ceb7ed9bcebde301488cfd507717d5d511674bc269c39ad41fc15d780";
};

export const syncTokenContracts = async (starting_tx_id = "0", batch_size = 1000, contractName: string = "submission") => {
	const res = await getContractChanges(contractName, starting_tx_id, batch_size);
	const length = res.history.length;

	/**
	 * 1. Get all contracts
	 */

	const all_contracts_titles = await getAllContracts();

	const contract_titles_parsed = all_contracts_titles.map((contract_title) => contract_title.contractName);
	/**
	 * 2. Get each contract's source code & check if it's a token.
	 */

	for (let contract_name of contract_titles_parsed) {
		// log.log(contract_name);
		const contract_source = await getContractSource(contract_name);
		// log.log(Object.keys(contract_source))
		if (contract_source.value) {
			const is_valid_token = validateTokenContract(contract_source.value);
			// console.log(contract_source);
			if (is_valid_token) {
				await prepareAndAddToken(contract_name);
			}
		}
	}

	if (length === batch_size) {
		const tx_uid = res.history[length - 1].tx_uid;
		console.log("getting more blocks from tx_uid : " + tx_uid);
		return await syncTokenContracts(tx_uid, batch_size);
	}
};
