import { BaseEntity } from "typeorm";
export declare class TradeHistoryEntity extends BaseEntity {
    id: string;
    contract_name: string;
    token_symbol: string;
    price: string;
    time: number;
    amount: string;
    vk: string;
    type: "buy" | "sell";
}
export declare function saveTradeUpdate(args: {
    contract_name: string;
    token_symbol: string;
    price: string;
    amount: string;
    vk: string;
    type: "buy" | "sell";
    time: number;
}): Promise<void>;
