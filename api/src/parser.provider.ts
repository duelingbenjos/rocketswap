import { Injectable } from "@nestjs/common";
import { IKvp } from "./types/misc.types";
import { config } from "./config";
import {
	getTokenList,
	prepareAddToken,
	saveToken
} from "./entities/token.entity";
import { getContractCode, validateTokenContract } from "./utils";
import { saveTransfer, updateBalance } from "./entities/balance.entity";
import { savePair, savePairLp, saveReserves } from "./entities/pair.entity";
import { saveUserLp } from "./entities/lp-points.entity";
import { savePrice } from "./entities/price.entity";
import { handleClientUpdate, IBlockParser } from "./types/websocket.types";

@Injectable()
export class ParserProvider {
	private token_contract_list: string[];
	private action_que: { action: any; args: any }[] = [];
	private action_que_processing: boolean;

	onModuleInit() {
		this.updateTokenList();
	}

	/** The action que is added to attempt to solve a bug where transactions coming in from the blockgrabber fail to be processed
	 * by the parser. Assuming that it's a race condition causing it, this approach should be effective.
	 */

	private async executeActionQue(action_que: { action: any; args: any }[]) {

		try {
			if (action_que.length) {
				console.log(`ACTION QUE PROCESSING ${action_que.length} `);
				const { action, args } = this.action_que[0];
				await action(args);
				this.action_que.splice(0, 1);
				this.executeActionQue(action_que);
			} else {
				this.action_que_processing = false;
			}
		} catch (err) {
			console.error(err);
			setTimeout(async () => this.executeActionQue(action_que), 1000);
		}
	}

	private addToActionQue(action: any, args) {
		this.action_que.push({ action, args });
		console.log(
			`ADDING ITEM TO ACTION QUE : ${this.action_que.length} ACTIONS OUTSTANDING`
		);
		if (!this.action_que_processing) {
			this.action_que_processing = true;
			this.executeActionQue(this.action_que);
		}
	}

	private async updateTokenList(): Promise<void> {
		const token_list_update = await getTokenList();
		this.token_contract_list = token_list_update;
		console.log(`Token list updated : ${this.token_contract_list}`);
	}

	/** This method is passed to the blockgrabber as a callback and checks
	 * if we're interested in the contents of the block.
	 */
	public async parseBlock(update: IBlockParser) {
		console.log(this.action_que.length);
		const { block, handleClientUpdate } = update;
		const { state, fn, contract: contract_name } = block;
		try {
			if (contract_name === "submission" && fn === "submit_contract") {
				// console.log(block);
				// Check if the submitted contract is a token, if it's a token, add it to the DB
				const contract_str = getContractCode(state);
				const token_is_valid = validateTokenContract(contract_str);
				// console.log(
				// 	`Valid token contract submitted : ${token_is_valid}`
				// );
				if (token_is_valid) {
					const add_token_dto = prepareAddToken(state);
					this.addToActionQue(saveToken, add_token_dto);
					const {
						contract_name,
						token_seed_holder: vk,
						base_supply: amount
					} = add_token_dto;
					updateBalance({ amount, contract_name, vk });
					this.addToActionQue(updateBalance, {
						amount,
						contract_name,
						vk
					});
				}
				await this.updateTokenList();
				return;
			} else if (contract_name === config.contractName) {
				// handle events for the AMM contract
				// console.log(`Found AMM contract block ...`);
				// console.log(state);
				this.addToActionQue(processAmmBlock, {
					state,
					handleClientUpdate
				});
				return;
			} else if (this.token_contract_list.includes(contract_name)) {
				// console.log(`Found block for token ${contract_name}`);
				// console.log(`function : ${fn}`);
				this.addToActionQue(saveTransfer, state);
			} else {
				// console.log(`ignoring block for contract: ${contract_name}`);
				// console.log(state);
				// console.log(state[state.length - 1].value);
				// console.log(fn);
			}
		} catch (err) {
			console.error(err);
		}
	}
}

async function processAmmBlock(args: {
	state: IKvp[];
	handleClientUpdate: handleClientUpdate;
}) {
	const { state, handleClientUpdate } = args;
	try {
		await savePair(state);
		await saveTransfer(state);
		await savePairLp(state);
		await saveUserLp(state);
		await saveReserves(state, handleClientUpdate);
		await savePrice(state, handleClientUpdate);
	} catch (err) {
		console.error(err);
	}
}
