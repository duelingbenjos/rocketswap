import { Client } from "socket.io";
import { AuthenticationPayload } from "src/authentication/trollbox.controller";
import { PriceEntity } from "src/entities/price.entity";
import { StakingMetaEntity } from "src/entities/staking-meta.entity";
import { BlockDTO } from "./misc.types";

export type handleClientUpdateType = (update: ClientUpdateType) => {};

export type handleAuthenticateResponseType = (auth_response: {
	socket_id: string;
	payload: AuthenticationPayload;
}) => void;

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

export interface IBlockParser {
	block: BlockDTO;
}

export type ClientUpdateType =
	| PriceUpdateType
	| MetricsUpdateType
	| BalanceUpdateType
	| TradeUpdateType
	| StakingMetaUpdateType;

export interface StakingMetaUpdateType extends UpdateType {
	action: "staking_meta_update";
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

export type UpdateType = {
	action:
		| "metrics_update"
		| "price_update"
		| "user_lp_update"
		| "balance_update"
		| "trade_update"
		| "staking_meta_update";
};

export interface TradeUpdateType extends UpdateType {
	action: "trade_update";
	type: "buy" | "sell";
	amount: string;
	contract_name: string;
	token_symbol: string;
	price: string;
	time: number;
}

export function isMetricsUpdate(
	client_update: ClientUpdateType
): client_update is MetricsUpdateType {
	return (client_update as MetricsUpdateType).action === "metrics_update";
}

export function isBalanceUpdate(
	client_update: ClientUpdateType
): client_update is BalanceUpdateType {
	return (client_update as BalanceUpdateType).action === "balance_update";
}

export function isPriceUpdate(
	client_update: ClientUpdateType
): client_update is PriceUpdateType {
	return (client_update as PriceUpdateType).action === "price_update";
}

export function isTradeUpdate(
	client_update: ClientUpdateType
): client_update is TradeUpdateType {
	return (client_update as TradeUpdateType).action === "trade_update";
}
