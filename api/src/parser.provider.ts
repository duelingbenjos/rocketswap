import { Injectable } from "@nestjs/common";
import { BlockDTO, IGameStateUpdate } from "./types/misc.types";
import { config } from "./config";
import {
	getTokenList,
	prepareAddToken,
	processAddToken
} from "./entities/token.entity";
import { getContractCode, validateTokenContract } from "./utils";
import { updateUserBalance } from "./entities/balance.entity";

@Injectable()
export class ParserProvider {
	private token_contract_list: string[];

	onModuleInit() {
		setTimeout(() => this.updateTokenList(), 1000);
	}

	private async updateTokenList(): Promise<void> {
		const token_list_update = await getTokenList();
		this.token_contract_list = token_list_update;
		console.log(`Token list updated : ${this.token_contract_list}`);
	}

	/** This method is passed to the blockgrabber as a callback and checks
	 * if we're interested in the contents of the block.
	 */
	public async parseBlock(block: BlockDTO, handleStateUpdate: Function) {
		const { state, fn, contract: contract_name } = block;
		try {
			if (contract_name === "submission" && fn === "submit_contract") {
				console.log(block);
				// Check if the submitted contract is a token, if it's a token, add it to the DB
				const contract_str = getContractCode(state);
				const token_is_valid = validateTokenContract(contract_str);
				console.log(
					`Valid token contract submitted : ${token_is_valid}`
				);
				if (token_is_valid) {
					const add_token_dto = prepareAddToken(state);
					await processAddToken(add_token_dto);
					const {
						contract_name,
						token_seed_holder: vk,
						base_supply: amount
					} = add_token_dto;
					await updateUserBalance({ amount, contract_name, vk });
					console.log(
						`Updated user balance for contract : ${contract_name}, amount: ${amount}, vk: ${vk}`
					);
				}
				await this.updateTokenList();
				return;
			} else if (contract_name === config.contractName) {
				// handle events for the AMM contract
				console.log(`Found AMM contract block ...`);
				return;
			} else if (this.token_contract_list.includes(contract_name)) {
				console.log(`Found block for token ${contract_name}`);
				console.log(`function : ${fn}`);
				console.log(state);
				// this contract is a token
			} else {
				console.log(`ignoring block for contract: ${contract_name}`);
			}
		} catch (err) {
			console.error(err);
		}
	}
}
