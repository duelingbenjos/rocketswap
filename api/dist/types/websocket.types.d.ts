import { AuthenticationPayload } from "src/authentication/trollbox.controller";
import { BlockDTO } from "./misc.types";
export declare type handleClientUpdate = (update: ClientUpdateType) => {};
export declare type handleAuthenticateResponse = (auth_response: {
    socket_id: string;
    payload: AuthenticationPayload;
}) => void;
export declare type handleTrollboxMsg = (payload: ITrollBoxMessage) => void;
export interface ITrollBoxMessage {
    sender: string;
    message: string;
    timestamp: number;
}
export interface IBlockParser {
    block: BlockDTO;
}
export declare type ClientUpdateType = PriceUpdateType | MetricsUpdateType | BalanceUpdateType | TradeUpdateType;
export interface PriceUpdateType extends UpdateType {
    action: "price_update";
    contract_name: string;
    price: string;
    time: number;
}
export interface UserLpUpdateType extends UpdateType {
    action: "user_lp_update";
    points: {
        [key: string]: string;
    };
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
export declare type UpdateType = {
    action: "metrics_update" | "price_update" | "user_lp_update" | "balance_update" | "trade_update";
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
export declare function isMetricsUpdate(client_update: ClientUpdateType): client_update is MetricsUpdateType;
export declare function isBalanceUpdate(client_update: ClientUpdateType): client_update is BalanceUpdateType;
export declare function isPriceUpdate(client_update: ClientUpdateType): client_update is PriceUpdateType;
export declare function isTradeUpdate(client_update: ClientUpdateType): client_update is TradeUpdateType;
