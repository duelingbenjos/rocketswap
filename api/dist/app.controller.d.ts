import { LpPointsEntity } from "./entities/lp-points.entity";
import { TokenEntity } from "./entities/token.entity";
export declare class AppController {
    constructor();
    getTokenList(): Promise<TokenEntity[]>;
    getMarketList(): Promise<TokenEntity[]>;
    getUserLpBalance(params: any): Promise<LpPointsEntity>;
    getPairsInfo(params: any): Promise<{}>;
    getBalances(params: any): Promise<any>;
}
