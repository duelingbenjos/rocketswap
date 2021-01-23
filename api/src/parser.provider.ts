import { Injectable } from "@nestjs/common";
import { BlockDTO, IKvp } from "./types/misc.types";
import { config } from "./config";
import {
	getTokenList,
	prepareAddToken,
	saveToken
} from "./entities/token.entity";
import { getContractCode, validateTokenContract } from "./utils";
import { saveTransfer, updateBalance } from "./entities/balance.entity";
import {
	PairEntity,
	savePair,
	savePairLp,
	saveReserves
} from "./entities/pair.entity";
import { updateLogo } from "./entities/token.entity";
import { saveUserLp } from "./entities/lp-points.entity";
import { savePrice } from "./entities/price.entity";
import { AppGateway } from "./app.gateway";
import { Server } from "socket.io";
import { handleClientUpdate, IBlockParser } from "./types/websocket.types";

@Injectable()
export class ParserProvider {
	private token_contract_list: string[];

	onModuleInit() {
		this.updateTokenList();
	}

	private async updateTokenList(): Promise<void> {
		const token_list_update = await getTokenList();
		this.token_contract_list = token_list_update;
		//console.log(`Token list updated : ${this.token_contract_list}`);
	}

	/** This method is passed to the blockgrabber as a callback and checks
	 * if we're interested in the contents of the block.
	 */
	public async parseBlock(update: IBlockParser) {
		const { block, handleClientUpdate } = update;
		const { state, fn, contract: contract_name } = block;
		try {
			if (contract_name === "submission" && fn === "submit_contract") {
				// Check if the submitted contract is a token, if it's a token, add it to the DB
				const contract_str = getContractCode(state);
				const token_is_valid = validateTokenContract(contract_str);
				if (token_is_valid) {
					const add_token_dto = prepareAddToken(state);
					await saveToken(add_token_dto);
					const {
						contract_name,
						token_seed_holder: vk,
						base_supply: amount
					} = add_token_dto;
					const res = await updateBalance({
						amount,
						contract_name,
						vk
					});
					handleClientUpdate({
						action: "balance_update",
						payload: res
					});
				}
				await this.updateTokenList();
				return;
			} else if (contract_name === config.contractName) {
				// handle events for the AMM contract
				await processAmmBlock(fn, state, handleClientUpdate);
				return;
			} else if (this.token_contract_list.includes(contract_name)) {
				// this contract is a token
				await saveTransfer(state, handleClientUpdate);
				await updateLogo(state, contract_name);
			}
		} catch (err) {
			console.error(err);
		}
	}
}

async function processAmmBlock(
	fn: string,
	state: IKvp[],
	handleClientUpdate: handleClientUpdate
) {
	try {
		await savePair(state);
		await saveTransfer(state, handleClientUpdate);
		await savePairLp(state);
		await saveUserLp(state);
		await saveReserves(fn, state, handleClientUpdate);
		await savePrice(state, handleClientUpdate);
	} catch (err) {
		console.error(err);
	}
}

// async function sendTradeUpdate(state: IKvp[], contract_name: string) {
// 	console.log(state);
// 	console.log(contract_name);

// 	// get token_name

// 	const reserve_entry = state.find((kvp) => {
// 		const { key } = kvp;
// 		const parts = key.split(".");
// 		return parts[1].split(":")[0] === "reserves" ? true : false;
// 	});

// 	console.log(reserve_entry);

// 	const token_name = reserve_entry.key.split(":")[1];
// 	const [new_currency_reserve, new_token_reserve] = [
// 		reserve_entry.value[0].__fixed__,
// 		reserve_entry.value[1].__fixed__
// 	];

// 	const pair_entity = await PairEntity.findOne(token_name);
// 	// console.log
// 	if (!pair_entity) return;
// 	const [old_currency_reserve, old_token_reserve] = pair_entity.reserves;

// 	// console.log(reserve_entry);
// 	// for (let kvp of state) {
// 	// 	const { key, value } = kvp;
// 	// 	const parts = key.split(".");
// 	// 	const is_balance = parts[1].split(":")[0] === "balances" ? true : false;
// 	// }
// }
