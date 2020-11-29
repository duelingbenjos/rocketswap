import { BlockDTO, IGameStateUpdate } from "../../../shared/types";
import { config } from "../../../shared/config";
import { prepareAddToken, processAddToken } from "./entities/token.entity";
import {
	getContractCode,
	getContractName,
	getVal,
	validateTokenContract
} from "./utils";

export async function parseBlock(block: BlockDTO, handleStateUpdate: Function) {
	const { state, fn, contract: contract_name } = block;

	if (contract_name === "submission" && fn === "submit_contract") {
		console.log(block);
		// Check if the submitted contract is a token, if it's a token, add it to the DB
		const contract_str = getContractCode(state);
		const token_is_valid = validateTokenContract(contract_str);
		console.log(token_is_valid);
		if (token_is_valid) {
			const add_token_dto = prepareAddToken(state);
			console.log(add_token_dto);
			await processAddToken(add_token_dto);
		}
		return;
	} else if (contract_name !== config.contractName) {
		// Exit from function if we're not interested in updates to this contract
		console.log(`ignoring block with contract : ${contract_name}`);
		return;
	}

	console.log(`adding block to DB ...`);
	console.log(state);
	console.log(fn);
	let state_update: IGameStateUpdate, game_id: string;
	switch (fn) {
		case "createGame":
			break;
		default:
	}
}

// function prepareDealHandData(state: IKvp[]): DealHandDTO {
// 	const game_id: string = getKey(state, 0, 2)
// 	const pot_size: number = getVal(state, 0)
// 	const card_1: ICard = getVal(state, 1)
// 	const card_2: ICard = getVal(state, 2)
// 	return { game_id, pot_size, card_1, card_2 }
// }

// function prepareDealDecisionCard(state: IKvp[]): DealDecisionCardDTO {
// 	const game_id: string = getKey(state, 0, 2)
// 	const game_balance: number = getVal(state, 1)
// 	const pot_size: number = getVal(state, 2)
// 	const round_index: number = getVal(state, 3)
// 	// const waiting: string[] = getVal(state, 3)
// 	// const orbit_count: number = getVal(state, 4)
// 	const wallet_balance: number = getVal(state, 4)
// 	const dealt_cards: IDealtCards = getVal(state, 0)
// 	return {
// 		game_balance,
// 		game_id,
// 		pot_size,
// 		round_index,
// 		dealt_cards,
// 		// waiting,
// 		// orbit_count,
// 		wallet_balance
// 	}
// }

// function prepareLeaveTableData(state: IKvp[]) {
// 	console.log(state)
// }

// function prepareJoinTableData(state: IKvp[]) {
// 	console.log(state)
// 	const game_id = state[0].key.split(':')[2]
// 	const players = state[0].value
// 	const game_state = state[1].value

// 	return { game_state, players, game_id }
// }

// function prepareAddFundsData(state: IKvp[]): AddFundsDTO {
// 	const parts = state[0].key.split(':')
// 	const address = parts[1]

// 	const amount_approved = parseFloat(state[0].value.__fixed__)
// 	const wallet_balance = parseFloat(state[1].value.__fixed__)
// 	const game_treasury = parseFloat(state[2].value.__fixed__)
// 	const game_balance = parseFloat(state[3].value.__fixed__)

// 	updateGameTreasury(game_treasury)

// 	return { address, amount_approved, wallet_balance, game_balance }
// }

// function prepareCreateGameData(state: { key: string; value: any }[]): GameDTO {
// 	const game_id: string = state[0].key.split(':')[2]
// 	if (!game_id) return
// 	const create_game_dto = {
// 		game_id
// 	} as GameDTO

// 	for (let kvp of state) {
// 		const parts = kvp.key.split(':')
// 		create_game_dto[parts[3]] = kvp.value
// 	}

// 	return create_game_dto
// }
