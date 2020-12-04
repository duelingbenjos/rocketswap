import { Module } from "@nestjs/common";
import { TypeOrmModule, TypeOrmModuleOptions } from "@nestjs/typeorm";
import { AppGateway } from "./app.gateway";
import { TokenEntity } from "./entities/token.entity";
import { AppController } from "./app.controller";
import { ParserProvider } from "./parser.provider";
import { BalanceEntity } from "./entities/balance.entity";
import { PairEntity } from "./entities/pair.entity";
import { PriceEntity } from "./entities/price.entity";
import { LpPointsEntity } from "./entities/lp-points.entity";

const db_options: TypeOrmModuleOptions = {
	name: "default",
	type: "sqlite",
	database: "database.sqlite",
	entities: [
		TokenEntity,
		BalanceEntity,
		PairEntity,
		PriceEntity,
		LpPointsEntity
	],
	synchronize: true,
	autoLoadEntities: true
};

@Module({
	imports: [TypeOrmModule.forRoot(db_options)],
	controllers: [AppController],
	providers: [AppGateway, ParserProvider]
})
export class AppModule {}
