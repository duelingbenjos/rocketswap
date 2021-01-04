import { PriceEntity } from "src/entities/price.entity";
import { BlockDTO } from "./misc.types";

export type handleClientUpdate = (update: ClientUpdateType) => {};

export interface IBlockParser {
	block: BlockDTO;
	handleClientUpdate: handleClientUpdate;
}

export type ClientUpdateType =
	| PriceUpdateType
	| MetricsUpdateType
	| BalanceUpdateType;

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
		| "balance_update";
};

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
