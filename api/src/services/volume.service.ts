import { Injectable, OnModuleInit } from "@nestjs/common";
import { SocketService } from "./socket.service";
import { log } from "../utils/logger";
import { TradeHistoryEntity } from "../entities/trade-history.entity";
import { MoreThan } from "typeorm";
import { PriceEntity } from "../entities/price.entity";
import { TokenEntity } from "../entities/token.entity";

@Injectable()
export class VolumeService implements OnModuleInit {
	constructor(private readonly socketService: SocketService) {
		// this.updateDailyVolumes().then(res => log.log(res))
	}

	async onModuleInit() {
		await this.updateDailyVolumes();
		setInterval(async () => {
			await this.updateDailyVolumes();
		}, 3000);
	}

	private async updateDailyVolumes() {
		try {
			const tokens = await TokenEntity.find();
			for (let token of tokens) {
				const { contract_name } = token;
				const one_day_ago = Date.now() / 1000 - 24 * 60 * 60;
				const trades_last_day = await TradeHistoryEntity.find({ where: { contract_name, time: MoreThan(one_day_ago) } });
				// log.log(trades_last_day.length);
				const daily_volume_tau = trades_last_day.reduce((accum, trade) => {
					accum += Number(trade.amount) * Number(trade.price);
					return accum;
				}, 0);
				token.daily_volume_tau = daily_volume_tau;
			}
			const proms = tokens.map((token) => token.save());
			await Promise.all(proms);
		} catch (err) {
			log.error(err);
		}
	}
}
