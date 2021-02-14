import { BaseEntity } from "typeorm";
import { IKvp } from "../types/misc.types";
export declare class TokenEntity extends BaseEntity {
    id: number;
    token_symbol: string;
    token_name: string;
    base_supply: string;
    contract_name: string;
    developer: string;
    owner: string;
    has_market: boolean;
    token_base64_svg: string;
    token_base64_png: string;
    token_logo_url: string;
}
export declare class AddTokenDto {
    token_symbol: string;
    token_name: string;
    base_supply: string;
    contract_name: string;
    token_seed_holder: string;
    developer: string;
    token_base64_svg?: string;
    token_base64_png?: string;
    token_logo_url?: string;
    owner?: string;
}
export declare const saveToken: (add_token_dto: AddTokenDto) => Promise<TokenEntity>;
export declare function prepareAddToken(state: IKvp[]): AddTokenDto;
export declare function saveTokenUpdate(state: IKvp[]): Promise<void>;
export declare function getTokenList(): Promise<string[]>;
