import { IBlockParser } from "./types/websocket.types";
export declare class ParserProvider {
    private token_contract_list;
    onModuleInit(): void;
    private updateTokenList;
    parseBlock(update: IBlockParser): Promise<void>;
}
