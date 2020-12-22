import { IKvp } from "../types/misc.types";
import { BaseEntity } from "typeorm";
export declare class BalanceEntity extends BaseEntity implements IBalance {
    vk: string;
    balances: UserBalancesType;
}
export declare function updateBalance(balance_dto: BalanceType): Promise<BalanceEntity>;
export declare type UserBalancesType = {
    [key: string]: number;
};
export declare type BalanceType = {
    contract_name: string;
    vk: string;
    amount: number;
};
export interface IBalance {
    vk: string;
    balances?: UserBalancesType;
}
export declare function saveTransfer(state: IKvp[]): Promise<void>;
