import { LpPointsEntity } from "./entities/lp-points.entity";
import { PairEntity } from "./entities/pair.entity";
import { TokenEntity } from "./entities/token.entity";
export declare class AppController {
    constructor();
    getTokenList(): Promise<TokenEntity[]>;
    getToken(params: any): Promise<{
        token: TokenEntity;
        lp_info: PairEntity;
    }>;
    getMarketList(): Promise<TokenEntity[]>;
    getUserLpBalance(params: any): Promise<LpPointsEntity>;
    getPairsInfo(params: any): Promise<{}>;
    getBalances(params: any): Promise<any>;
}
