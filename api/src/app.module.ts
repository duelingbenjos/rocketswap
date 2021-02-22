import { Logger, Module } from "@nestjs/common";
import { TypeOrmModule, TypeOrmModuleOptions } from "@nestjs/typeorm";
import { AppGateway } from "./app.gateway";
import { TokenEntity } from "./entities/token.entity";
import { AppController } from "./app.controller";
import { ParserProvider } from "./parser.provider";
import { BalanceEntity } from "./entities/balance.entity";
import { PairEntity } from "./entities/pair.entity";
import { PriceEntity } from "./entities/price.entity";
import { LpPointsEntity } from "./entities/lp-points.entity";
import { TradeHistoryEntity } from "./entities/trade-history.entity";
import { SocketService } from "./socket.service";
import { NameEntity } from "./entities/name.entity";
import { TrollboxController } from "./authentication/trollbox.controller";
import { RefreshTokensRepository } from "./authentication/refresh-token.repository";
import { TokensService } from "./authentication/tokens.service";
import { JwtModule, JwtService } from "@nestjs/jwt";
import { JWTGuard } from "./authentication/jwt.guard";
import { AuthService } from "./authentication/trollbox.service";
import { RefreshTokenEntity } from "./entities/refresh-token.entity";
import { JwtStrategy } from "./authentication/jwt.strategy";
import { ChatHistoryEntity } from "./entities/chat-history.entity";

const db_options: TypeOrmModuleOptions = {
	name: "default",
	type: "sqlite",
	database: "database.sqlite",
	entities: [
		TokenEntity,
		BalanceEntity,
		PairEntity,
		PriceEntity,
		LpPointsEntity,
		TradeHistoryEntity,
		NameEntity,
		RefreshTokenEntity,
		ChatHistoryEntity
	],
	synchronize: true,
	autoLoadEntities: true
};

@Module({
	imports: [
		TypeOrmModule.forRoot(db_options),
		JwtModule.register({
			secret: "<SECRET KEY>",
			signOptions: {
				expiresIn: "1m"
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
		Logger
	]
})
export class AppModule {}
