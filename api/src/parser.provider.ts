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
import { savePair, savePairLp, saveReserves } from "./entities/pair.entity";
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
				//console.log(block);
				// Check if the submitted contract is a token, if it's a token, add it to the DB
				const contract_str = getContractCode(state);
				const token_is_valid = validateTokenContract(contract_str);
				/*console.log(
					`Valid token contract submitted : ${token_is_valid}`
				);*/
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
					/*
					console.log(
						`Updated user balance for contract : ${contract_name}, amount: ${amount}, vk: ${vk}`
					);*/
				}
				await this.updateTokenList();
				return;
			} else if (contract_name === config.contractName) {
				// handle events for the AMM contract
				//console.log(`Found AMM contract block ...`);
				//console.log(state);
				await processAmmBlock(state, handleClientUpdate);
				return;
			} else if (this.token_contract_list.includes(contract_name)) {
				// this contract is a token
				//console.log(`Found block for token ${contract_name}`);
				//console.log(`function : ${fn}`);
				// console.log(state);
				// if (fn === "transfer") {
				await saveTransfer(state, handleClientUpdate);
				await updateLogo(state, contract_name);
				// }
			} else {
				/*
				console.log(`ignoring block for contract: ${contract_name}`);
				console.log(state);
				console.log(state[state.length - 1].value);
				console.log(fn);*/
			}
		} catch (err) {
			console.error(err);
		}
	}
}

async function processAmmBlock(
	state: IKvp[],
	handleClientUpdate: handleClientUpdate
) {
	try {
		await savePair(state);
		await saveTransfer(state, handleClientUpdate);
		await savePairLp(state);
		await saveUserLp(state);
		await saveReserves(state, handleClientUpdate);
		await savePrice(state, handleClientUpdate);
	} catch (err) {
		console.error(err);
	}
}
