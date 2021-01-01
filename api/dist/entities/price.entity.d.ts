import { IKvp } from "src/types/misc.types";
import { BaseEntity } from "typeorm";
import { handleClientUpdate } from "src/types/websocket.types";
export declare class PriceEntity extends BaseEntity {
    id: string;
    contract_name: string;
    price: string;
    time: string;
}
export declare function savePrice(state: IKvp[], handleClientUpdate: handleClientUpdate): Promise<void>;
export declare function getTokenMetrics(contract_name: string): Promise<{
    contract_name: string;
    price: string;
    time: number;
    reserves: [string, string];
    lp: string;
}>;
