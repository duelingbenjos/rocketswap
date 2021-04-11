import { Logger, Module } from "@nestjs/common";
import { TypeOrmModule, TypeOrmModuleOptions } from "@nestjs/typeorm";
import { AppGateway } from "./app.gateway";
import { TokenEntity } from "./entities/token.entity";
import { AppController } from "./app.controller";
import { ParserProvider } from "./parser.provider";
import { BalanceEntity } from "./entities/balance.entity";
import { PairEntity } from "./entities/pair.entity";
import { LpPointsEntity } from "./entities/lp-points.entity";
import { TradeHistoryEntity } from "./entities/trade-history.entity";
import { SocketService } from "./services/socket.service";
import { NameEntity } from "./entities/name.entity";
import { TrollboxController } from "./authentication/trollbox.controller";
import { RefreshTokensRepository } from "./authentication/refresh-token.repository";
import { TokensService } from "./authentication/tokens.service";
import { JwtModule } from "@nestjs/jwt";
import { JWTGuard } from "./authentication/jwt.guard";
import { AuthService } from "./authentication/trollbox.service";
import { RefreshTokenEntity } from "./entities/refresh-token.entity";
import { JwtStrategy } from "./authentication/jwt.strategy";
import { ChatHistoryEntity } from "./entities/chat-history.entity";
import { TransactionService } from "./services/transaction.service";
import { AmmMetaEntity } from "./entities/amm-meta.entity";
import { StakingMetaEntity } from "./entities/staking-meta.entity";
import { UserStakingEntity } from "./entities/user-staking.entity";
import { StakingEpochEntity } from "./entities/staking-epoch.entity";
import { TauMarketEntity } from "./entities/tau-market.entity";
import { TradeSubscriber } from "./subscribers/trade.subscriber";
import { PriceEntity } from "./entities/price.entity";
import { VolumeService } from "./services/volume.service";
import { VolumeMetricsEntity } from "./entities/volume-metrics.entity";
import { MarketcapEntity } from "./entities/marketcap.entity";
import { MarketcapService } from "./services/marketcap.service";
import { CoinGeckoAPIService } from "./services/coingecko.service";

const db_options: TypeOrmModuleOptions = {
	name: "default",
	type: "sqlite",
	database: "database.sqlite",
	entities: [
		TokenEntity,
		BalanceEntity,
		PairEntity,
		LpPointsEntity,
		TradeHistoryEntity,
		NameEntity,
		PriceEntity,
		RefreshTokenEntity,
		ChatHistoryEntity,
		AmmMetaEntity,
		StakingMetaEntity,
		UserStakingEntity,
		StakingEpochEntity,
		TauMarketEntity,
		VolumeMetricsEntity,
		MarketcapEntity
	],
	subscribers: [TradeSubscriber],
	synchronize: true,
	autoLoadEntities: true
};

@Module({
	imports: [
		TypeOrmModule.forRoot(db_options),
		JwtModule.register({
			secret: process.env.SECRET || "<SECRET KEY>",
			signOptions: {
				expiresIn: "30d"
			}
		})
	],
	controllers: [AppController, TrollboxController],
	providers: [
		AppGateway,
		ParserProvider,
		SocketService,
		TokensService,
		RefreshTokensRepository,
		JWTGuard,
		JwtStrategy,
		AuthService,
		Logger,
		TransactionService,
		StakingEpochEntity,
		VolumeService,
		MarketcapService,
		CoinGeckoAPIService
	]
})
export class AppModule {}
