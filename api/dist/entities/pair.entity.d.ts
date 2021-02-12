import { IKvp } from "src/types/misc.types";
import { BaseEntity } from "typeorm";
import { handleClientUpdate } from "src/types/websocket.types";
export declare class PairEntity extends BaseEntity {
    contract_name: string;
    lp: string;
    time: string;
    price: string;
    token_symbol: string;
    reserves: [string, string];
}
export declare function saveReserves(fn: string, state: IKvp[], handleClientUpdate: handleClientUpdate, timestamp: number): Promise<void>;
export declare function savePair(state: IKvp[]): Promise<void>;
export declare function savePairLp(state: IKvp[]): Promise<void>;
