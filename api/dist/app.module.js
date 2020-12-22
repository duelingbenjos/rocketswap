"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const app_gateway_1 = require("./app.gateway");
const token_entity_1 = require("./entities/token.entity");
const app_controller_1 = require("./app.controller");
const parser_provider_1 = require("./parser.provider");
const balance_entity_1 = require("./entities/balance.entity");
const pair_entity_1 = require("./entities/pair.entity");
const price_entity_1 = require("./entities/price.entity");
const lp_points_entity_1 = require("./entities/lp-points.entity");
const db_options = {
    name: "default",
    type: "sqlite",
    database: "database.sqlite",
    entities: [
        token_entity_1.TokenEntity,
        balance_entity_1.BalanceEntity,
        pair_entity_1.PairEntity,
        price_entity_1.PriceEntity,
        lp_points_entity_1.LpPointsEntity
    ],
    synchronize: true,
    autoLoadEntities: true
};
let AppModule = class AppModule {
};
AppModule = __decorate([
    common_1.Module({
        imports: [typeorm_1.TypeOrmModule.forRoot(db_options)],
        controllers: [app_controller_1.AppController],
        providers: [app_gateway_1.AppGateway, parser_provider_1.ParserProvider]
    })
], AppModule);
exports.AppModule = AppModule;
//# sourceMappingURL=app.module.js.map