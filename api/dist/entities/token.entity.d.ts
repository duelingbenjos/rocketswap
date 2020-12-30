import { BaseEntity } from "typeorm";
import { IKvp } from "../types/misc.types";
export declare class TokenEntity extends BaseEntity {
    id: number;
    token_symbol: string;
    token_name: string;
    base_supply: number;
    contract_name: string;
    developer: string;
    has_market: boolean;
}
export declare class AddTokenDto {
    token_symbol: string;
    token_name: string;
    base_supply: number;
    contract_name: string;
    token_seed_holder: string;
    developer: string;
    lp_info?: object;
}
export declare const saveToken: (add_token_dto: AddTokenDto) => Promise<TokenEntity>;
export declare function prepareAddToken(state: IKvp[]): AddTokenDto;
export declare function getTokenList(): Promise<string[]>;
export declare function getOneToken(): Promise<string[]>;
