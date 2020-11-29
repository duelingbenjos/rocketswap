export class BlockDTO {
	state: IKvp[];
	fn: string;
	contract: string;
}

export interface IKvp {
	key: string;
	value: any;
}

// import { GameEntity } from "src/entities/game.entity";

export interface GameDTO {
	game_id: string;
	game_state: string;
	number_of_seats: number;
	host: string;
	ante: number;
	minimum_amount: number;
	pot_size: number;
	round_index: number;
	players: string[];
	sitting_out: string[];
	waiting: string[];
	leaving: string[];
}

export interface IGameStateUpdate {
	// context: "global" | "player" | "table";
	action:
		| "createGame"
		| "addFunds"
		| "joinTable"
		| "dealDecisionCard"
		| "dealHand";
	time: string;
	state: GameDTO | BalanceDTO | JoinTableDTO | DealHandDTO;
	prev_state?: GameDTO | BalanceDTO | JoinTableDTO;
}

export interface ICard {
	index: number;
	value: number;
}

export interface DealDecisionCardDTO {
	game_id: string;
	pot_size: number;
	game_balance: number;
	round_index: number;
	waiting?: string[];
	orbit_count?: number;
	wallet_balance: number;
	dealt_cards: IDealtCards
	// decision_card: ICard;
}

export interface DealHandDTO {
	game_id: string;
	pot_size: number;
	card_1: ICard;
	card_2: ICard;
}

export interface BalanceDTO {
	id: string;
	amount_approved: number;
	game_balance: number;
	wallet_balance: number;
}

export interface JoinTableDTO {
	players: string[];
	game_state: string;
	game_id: string;
}

export interface IPlayersState {
	players: string[];
	waiting: string[];
	leaving: string[];
	sitting_out: string[];
}

export interface ICard {
	value: number;
	index: number;
}
export interface IDealtCards {
	card_1?: ICard;
	card_2?: ICard;
	decision_card?: ICard;
}

