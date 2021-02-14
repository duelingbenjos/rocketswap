import { LpPointsEntity } from "./entities/lp-points.entity";
import { PairEntity } from "./entities/pair.entity";
import { TokenEntity } from "./entities/token.entity";
import { TradeHistoryEntity } from "./entities/trade-history.entity";
export declare class AppController {
    constructor();
    getTradeHistory(params: any): Promise<TradeHistoryEntity[]>;
    getTokenList(): Promise<{
        contract_name: string;
        has_market: boolean;
        token_base64_png: string;
        token_base64_svg: string;
        logo: {
            type: string;
            data: string;
        };
        token_logo_url: string;
        token_name: string;
        token_symbol: string;
    }[]>;
    getToken(params: any): Promise<{
        token: TokenEntity;
        lp_info: PairEntity;
    }>;
    getMarketList(): Promise<TokenEntity[]>;
    getUserLpBalance(params: any): Promise<LpPointsEntity>;
    getPairsInfo(params: any): Promise<{}>;
    getBalances(params: any): Promise<any>;
}
