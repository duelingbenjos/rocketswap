import { IKvp } from "../types/misc.types";
import { BaseEntity } from "typeorm";
import { handleClientUpdate } from "../types/websocket.types";
export declare class BalanceEntity extends BaseEntity implements IBalance {
    vk: string;
    balances: UserBalancesType;
}
export declare function updateBalance(balance_dto: BalanceType): Promise<BalanceEntity>;
export declare type UserBalancesType = {
    [key: string]: string;
};
export declare type BalanceType = {
    contract_name: string;
    vk: string;
    amount: string;
};
export interface IBalance {
    vk: string;
    balances?: UserBalancesType;
}
export declare function saveTransfer(state: IKvp[], handleClientUpdate: handleClientUpdate): Promise<void>;
