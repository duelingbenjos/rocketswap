import { IKvp } from "./types/misc.types";
export declare const isLamdenKey: (key: any) => boolean;
export declare const getNewJoiner: (state: any, prev_state: any) => string;
export declare function validateTokenContract(contract: string): boolean;
export declare function getKey(state: IKvp[], idx_1: number, idx_2: number): string;
export declare function getVal(state: IKvp[] | IKvp, idx?: number): any;
export declare function getContractName(state: IKvp[]): string;
export declare function getContractEntry(state: IKvp[]): IKvp;
export declare function getContractCode(state: IKvp[]): any;
