import { BaseEntity } from "typeorm";
import { IKvp } from "../types/misc.types";
export declare class TokenEntity extends BaseEntity {
    id: number;
    token_symbol: string;
    token_name: string;
    base_supply: string;
    contract_name: string;
    developer: string;
    has_market: boolean;
    logo_svg_base64: string;
}
export declare class AddTokenDto {
    token_symbol: string;
    token_name: string;
    base_supply: string;
    contract_name: string;
    token_seed_holder: string;
    developer: string;
    lp_info?: object;
    logo_svg_base64: string;
}
export declare const saveToken: (add_token_dto: AddTokenDto) => Promise<TokenEntity>;
export declare function prepareAddToken(state: IKvp[]): AddTokenDto;
export declare function updateLogo(state: IKvp[], contract_name: string): Promise<void>;
export declare function getTokenList(): Promise<string[]>;
