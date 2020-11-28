import { Module } from '@nestjs/common'
import { BalanceEntity } from './entities/balance.entity'
import { GameEntity } from './entities/game.entity'
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm'
import { AppGateway } from './app.gateway'
import { HandEntity } from './entities/hand.entity'
import { TreasuryEntity } from './entities/treasury.entity'
import { TableLogEntity } from './entities/table-log.entity'

const db_options: TypeOrmModuleOptions = {
	name: 'default',
	type: 'sqlite',
	database: 'database.sqlite',
	entities: [],
	synchronize: true,
	autoLoadEntities: true
}

@Module({
	imports: [TypeOrmModule.forRoot(db_options)],
	controllers: [],
	providers: [AppGateway]
})
export class AppModule {}
