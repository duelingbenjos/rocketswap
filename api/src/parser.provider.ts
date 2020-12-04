import { Injectable } from "@nestjs/common";
import { BlockDTO, IGameStateUpdate, IKvp } from "./types/misc.types";
import { config } from "./config";
import {
	getTokenList,
	prepareAddToken,
	processAddToken
} from "./entities/token.entity";
import { getContractCode, validateTokenContract } from "./utils";
import { handleTransfer, updateBalance } from "./entities/balance.entity";
import { savePair, savePairLp, saveReserves } from "./entities/pair.entity";
import { saveUserLp } from "./entities/lp-points.entity";
import { savePrice } from "./entities/price.entity";

@Injectable()
export class ParserProvider {
	private token_contract_list: string[];

	onModuleInit() {
		this.updateTokenList();
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
					await updateBalance({ amount, contract_name, vk });
					console.log(
						`Updated user balance for contract : ${contract_name}, amount: ${amount}, vk: ${vk}`
					);
				}
				await this.updateTokenList();
				return;
			} else if (contract_name === config.contractName) {
				// handle events for the AMM contract
				console.log(`Found AMM contract block ...`);
				console.log(state)
				if (fn === "create_market") {
					await processCreateMarket(state);
				} else if (fn === 'add_liquidity'){
					await processAddLiquidity(state)
				}
				return;
			} else if (this.token_contract_list.includes(contract_name)) {
				console.log(`Found block for token ${contract_name}`);
				console.log(`function : ${fn}`);
				console.log(state);
				if (fn === "transfer") {
					handleTransfer(state);
				}
				// this contract is a token
			} else {
				console.log(`ignoring block for contract: ${contract_name}`);
				console.log(state);
				console.log(state[state.length - 1].value);
				console.log(fn);
			}
		} catch (err) {
			console.error(err);
		}
	}
}

async function processCreateMarket(state: IKvp[]) {
	try {
		await savePair(state);
		await handleTransfer(state);
		await savePairLp(state);
		await saveUserLp(state);
		await saveReserves(state);
		await savePrice(state);
	} catch (err) {
		console.error(err);
	}
}

async function processAddLiquidity(state: IKvp[]) {
	try {
		await handleTransfer(state);
		await savePairLp(state);
		await saveUserLp(state);
		await saveReserves(state);
		await savePrice(state);
	} catch (err) {
		console.error(err);
	}
}

[
	{
	  key: 'currency.balances:f8a429afc20727902fa9503f5ecccc9b40cfcef5bcba05204c19e44423e65def:con_amm2',
	  value: { __fixed__: '107000.0' }
	},
	{
	  key: 'currency.balances:f8a429afc20727902fa9503f5ecccc9b40cfcef5bcba05204c19e44423e65def',
	  value: { __fixed__: '1705.93130000' }
	},
	{ key: 'currency.balances:con_amm2', value: { __fixed__: '3000.0' } },
	{
	  key: 'con_token_test14.balances:f8a429afc20727902fa9503f5ecccc9b40cfcef5bcba05204c19e44423e65def',
	  value: { __fixed__: '99997900.0' }
	},
	{
	  key: 'con_token_test14.balances:con_amm2',
	  value: { __fixed__: '2100.0' }
	},
	{
	  key: 'con_amm2.lp_points:con_token_test14:f8a429afc20727902fa9503f5ecccc9b40cfcef5bcba05204c19e44423e65def',
	  value: { __fixed__: '2100.0' }
	},
	{
	  key: 'con_amm2.lp_points:con_token_test14',
	  value: { __fixed__: '2100.0' }
	},
	{
	  key: 'con_amm2.reserves:con_token_test14',
	  value: [ [Object], [Object] ]
	}
  ]

