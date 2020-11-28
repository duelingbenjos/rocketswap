import {
	createGame,
	getPreviousTableState,
	processDealHand,
	processJoinTable,
	processDealDecisionCard
} from "./entities/game.entity";
import {
	DealDecisionCardDTO,
	DealHandDTO,
	GameDTO,
	ICard,
	IDealtCards,
	IGameStateUpdate
} from "../../../shared/types";
import { config } from "../../../shared/config";
import {
	AddFundsDTO,
	processAddFunds,
	processApproval
} from "./entities/balance.entity";
import { updateGameTreasury } from "./entities/treasury.entity";

/**
 *
 * Contracts must have the following fields to be added to the watch list:
 * 'def transfer', 'def balance_of', 'def allowance' 'def approve', 'def transfer_from', 'token_name = Variable', 'token_symbol = Variable'
 */

function validateTokenContract(contract: string) {
	console.log(contract)
	const required_fields = [
		"def transfer",
		"def balance_of",
		"def allowance",
		"def approve",
		"def transfer_from",
		"token_name = Variable",
		"token_symbol = Variable"
	];
	required_fields.forEach((field) => {
		if (!contract.includes(field)) {
			console.log(`field missing: ${field}`);
			return false;
		}
	});
	return true;
}

export async function blockParser(
	block: BlockDTO,
	handleStateUpdate: Function
) {
	const { state, fn, contract } = block;
	// console.log(block)

	if (contract === "submission" && fn === "submit_contract") {
		const contract_str = state[3];

		// const approved_contract: string = parts[2]
		console.log("contract processed");
		const validated = validateTokenContract(contract_str.value);
		console.log(`contract validated: ${validated}`);
		// if (approved_contract === config.contractName) {
		// const wallet_address = parts[1]
		// const approved_amount = state[0].value.__fixed__
		// const wallet_balance = state[1].value.__fixed__

		// await processApproval(
		// 	wallet_address,
		// 	approved_amount,
		// 	wallet_balance
		// )
		// }
	} else if (contract !== config.contractName) {
		console.log(`ignoring block with contract : ${contract}`);
		return;
	}

	console.log(`adding AC2C block to DB ...`);
	console.log(state);
	console.log(fn);
	let state_update: IGameStateUpdate, game_id: string;
	switch (fn) {
		case "createGame":
			// const create_game_dto = prepareCreateGameData(state)
			// await createGame(create_game_dto)

			// state_update = {
			// 	action: 'createGame',
			// 	state: create_game_dto,
			// 	time: Date.now().toString()
			// }
			// handleStateUpdate(state_update)
			break;
		default:
	}
}

function getKey(state: IKvp[], idx_1: number, idx_2: number) {
	return state[idx_1].key.split(":")[idx_2];
}

function getVal(state: IKvp[], idx: number) {
	const val = state[idx].value;
	return val.__fixed__ ? parseFloat(val.__fixed__) : val;
}

// function prepareDealHandData(state: IKvp[]): DealHandDTO {
// 	const game_id: string = getKey(state, 0, 2)
// 	const pot_size: number = getVal(state, 0)
// 	const card_1: ICard = getVal(state, 1)
// 	const card_2: ICard = getVal(state, 2)
// 	return { game_id, pot_size, card_1, card_2 }
// }
// ;[
// 	{
// 		key: 'con_ac2c_master_05.S:games:94948929285602138:dealt_cards',
// 		value: { card_1: [Object], card_2: [Object], decision_card: [Object] }
// 	},
// 	{
// 		key:
// 			'con_ac2c_master_05.Balances:96dae3b6213fb80eac7c6f4fa0fd26f34022741c56773107b20199cb43f5ed62',
// 		value: { __fixed__: '48.000000000' }
// 	},
// 	{
// 		key: 'con_ac2c_master_05.S:games:94948929285602138:pot_size',
// 		value: { __fixed__: '2.0' }
// 	},
// 	{
// 		key: 'con_ac2c_master_05.S:games:94948929285602138:round_index',
// 		value: 1
// 	},
// 	{
// 		key:
// 			'currency.balances:96dae3b6213fb80eac7c6f4fa0fd26f34022741c56773107b20199cb43f5ed62',
// 		value: { __fixed__: '32.300000000' }
// 	}
// ]

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

export class BlockDTO {
	state: IKvp[];
	fn: string;
	contract: string;
}

export interface IKvp {
	key: string;
	value: any;
}
