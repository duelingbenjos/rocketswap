import { StakingEpochEntity } from "../entities/staking-epoch.entity";
import { AuthenticationPayload } from "../authentication/trollbox.controller";
import { StakingMetaEntity } from "../entities/staking-meta.entity";
import { UserStakingEntity } from "../entities/user-staking.entity";
import { PairEntity } from "../entities/pair.entity";

export type handleClientUpdateType = (update: ClientUpdateType) => Promise<void>;

export type handleAuthenticateResponseType = (auth_response: { socket_id: string; payload: AuthenticationPayload }) => void;

export type handleTrollboxMsg = (payload: ITrollBoxMessage) => void;
export type handleProxyTxnResponse = (txn_response: IProxyTxnReponse) => void;

export interface ITxnRequest {
	metadata: any;
	payload: any;
}
export interface IProxyTxnReponse {
	payload: any;
	socket_id: string;
}
export interface ITrollBoxMessage {
	sender: string;
	message: string;
	timestamp: number;
}

export interface IUserYieldInfo {
	total_staked: number;
	current_yield: number;
	yield_per_sec: number;
	epoch_updated: number;
	time_updated: number;
	user_reward_rate?: number;
}

export type ClientUpdateType =
	| PriceUpdateType
	| MetricsUpdateType
	| BalanceUpdateType
	| UserLpUpdateType
	| TradeUpdateType
	| StakingMetaUpdateType
	| UserYieldUpdateType
	| EpochUpdateType
	| ClientStakingUpdateType
	| TauUsdPriceUpdateType
	| NewMarketType;

export interface ClientStakingUpdateType extends UpdateType {
	action: "client_staking_update";
	staking_contract: string;
}

export interface NewMarketType extends UpdateType {
	action: "new_market_update";
	pair: PairEntity;
}

export interface EpochUpdateType extends UpdateType {
	action: "epoch_update";
	data: StakingEpochEntity;
}

export interface UserYieldUpdateType extends UpdateType {
	action: "user_yield_update";
	data: IUserYieldPayload;
	vk: string;
}

export interface IUserYieldPayload {
	[key: string]: IUserYieldInfo;
}

export interface StakingMetaUpdateType extends UpdateType {
	action: "staking_panel_update";
	data: StakingMetaEntity;
}

export interface PriceUpdateType extends UpdateType {
	action: "price_update";
	contract_name: string;
	price: string;
	time: number;
}

export interface UserLpUpdateType extends UpdateType {
	action: "user_lp_update";
	points: { [key: string]: string };
	vk: string;
}

export interface MetricsUpdateType extends UpdateType {
	action: "metrics_update";
	contract_name: string;
	price: string;
	time: number;
	reserves: [string, string];
	lp: string;
}

export interface BalanceUpdateType extends UpdateType {
	action: "balance_update";
	payload: any;
}

export interface TauUsdPriceUpdateType extends UpdateType {
	action: "tau_usd_price";
	price: string;
}

export type UpdateType = {
	action:
		| "metrics_update"
		| "price_update"
		| "user_lp_update"
		| "balance_update"
		| "trade_update"
		| "staking_panel_update"
		| "user_staking_update"
		| "epoch_update"
		| "user_yield_update"
		| "client_staking_update"
		| "tau_usd_price"
		| "new_market_update";
};

export interface TradeUpdateType extends UpdateType {
	action: "trade_update";
	type: "buy" | "sell";
	amount: string;
	contract_name: string;
	token_symbol: string;
	price: string;
	time: number;
	hash: string;
}

export function isMetricsUpdate(client_update: ClientUpdateType): client_update is MetricsUpdateType {
	return (client_update as MetricsUpdateType).action === "metrics_update";
}

export function isBalanceUpdate(client_update: ClientUpdateType): client_update is BalanceUpdateType {
	return (client_update as BalanceUpdateType).action === "balance_update";
}

export function isTauUsdPriceUpdate(client_update: ClientUpdateType): client_update is TauUsdPriceUpdateType {
	return (client_update as TauUsdPriceUpdateType).action === "tau_usd_price";
}

export function isUserLpUpdateType(client_update: ClientUpdateType): client_update is UserLpUpdateType {
	return (client_update as UserLpUpdateType).action === "user_lp_update";
}

export function isPriceUpdate(client_update: ClientUpdateType): client_update is PriceUpdateType {
	return (client_update as PriceUpdateType).action === "price_update";
}

export function isTradeUpdate(client_update: ClientUpdateType): client_update is TradeUpdateType {
	return (client_update as TradeUpdateType).action === "trade_update";
}

export function isUserYieldUpdate(client_update: ClientUpdateType): client_update is UserYieldUpdateType {
	return (client_update as UserYieldUpdateType).action === "user_yield_update";
}

export function isEpochUpdate(client_update: ClientUpdateType): client_update is EpochUpdateType {
	return (client_update as EpochUpdateType).action === "epoch_update";
}

export function isClientStakingUpdate(client_update: ClientUpdateType): client_update is ClientStakingUpdateType {
	return (client_update as ClientStakingUpdateType).action === "client_staking_update";
}

export function isNewMarketUpdate(client_update: ClientUpdateType): client_update is NewMarketType {
	return (client_update as NewMarketType).action === "new_market_update";
}

export function isStakingPanelUpdate(client_update: ClientUpdateType): client_update is StakingMetaUpdateType {
	return (client_update as StakingMetaUpdateType).action === "staking_panel_update";
}
