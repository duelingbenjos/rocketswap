import { IKvp } from "src/types/misc.types";
import { BaseEntity } from "typeorm";
import { handleClientUpdate } from "src/types/websocket.types";
export declare class PairEntity extends BaseEntity {
    contract_name: string;
    lp: number;
    time: string;
    price: number;
    reserves: [number, number];
}
export declare function saveReserves(state: IKvp[], handleClientUpdate: handleClientUpdate): Promise<void>;
export declare function savePair(state: IKvp[]): Promise<void>;
export declare function savePairLp(state: IKvp[]): Promise<void>;
