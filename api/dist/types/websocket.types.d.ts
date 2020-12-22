import { BlockDTO } from "./misc.types";
export declare type handleClientUpdate = (update: ClientUpdateType) => {};
export interface IBlockParser {
    block: BlockDTO;
    handleClientUpdate: handleClientUpdate;
}
export declare type ClientUpdateType = PriceUpdateType | MetricsUpdateType;
export interface PriceUpdateType extends UpdateType {
    action: "price_update";
    contract_name: string;
    price: number;
    time: number;
}
export interface UserLpUpdateType extends UpdateType {
    action: "user_lp_update";
    points: {
        [key: string]: number;
    };
}
export interface MetricsUpdateType extends UpdateType {
    action: "metrics_update";
    contract_name: string;
    price: number;
    time: number;
    reserves: [number, number];
    lp: number;
}
export declare type UpdateType = {
    action: "metrics_update" | "price_update" | 'user_lp_update';
};
export declare function isMetricsUpdate(client_update: ClientUpdateType): client_update is MetricsUpdateType;
export declare function isPriceUpdate(client_update: ClientUpdateType): client_update is PriceUpdateType;
