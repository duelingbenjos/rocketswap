import { Module } from "@nestjs/common";
import { TypeOrmModule, TypeOrmModuleOptions } from "@nestjs/typeorm";
import { AppGateway } from "./app.gateway";
import { TokenEntity } from "./entities/token.entity";
import { AppController } from './app.controller';

const db_options: TypeOrmModuleOptions = {
	name: "default",
	type: "sqlite",
	database: "database.sqlite",
	entities: [TokenEntity],
	synchronize: true,
	autoLoadEntities: true
};

@Module({
	imports: [TypeOrmModule.forRoot(db_options)],
	controllers: [AppController],
	providers: [AppGateway]
})
export class AppModule {}
