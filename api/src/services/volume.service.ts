import { Injectable, OnModuleInit } from "@nestjs/common";
import { SocketService } from "./socket.service";
import { log } from "../utils/logger";
import { TradeHistoryEntity } from "../entities/trade-history.entity";
import { LessThan, MoreThan } from "typeorm";
import { TokenEntity } from "../entities/token.entity";
import { VolumeMetricsEntity } from "../entities/volume-metrics.entity";
import { config } from "../config";

@Injectable()
export class VolumeService implements OnModuleInit {
	async onModuleInit() {
		await this.updateDailyVolumes();
		setInterval(async () => {
			await this.updateDailyVolumes();
		}, 20000);
	}

	private async updateDailyVolumes() {
		try {
			const tokens = await TokenEntity.find({ where: { has_market: true } });
			const proms: Promise<any>[] = [];
			for (let token of tokens) {
				const { contract_name } = token;

				let token_metrics_entity = await VolumeMetricsEntity.findOne(contract_name);
				if (!token_metrics_entity) {
					token_metrics_entity = new VolumeMetricsEntity();
					token_metrics_entity.contract_name = contract_name;
					token_metrics_entity.MarketName = `${config.currencySymbol.toUpperCase()}/${token.token_symbol.toUpperCase()}`;
					token_metrics_entity.token_symbol = token.token_symbol;
				}
				if (!token_metrics_entity.token_attached) {
					const token_entity = await TokenEntity.findOne({ where: { contract_name } });
					if (token_entity) {
						token_metrics_entity.token = token_entity;
						token_metrics_entity.token_attached = true;
					}
				}

				const last_yesterday_trade = await this.getLastYesterdayTrade(contract_name);
				log.log({ contract_name });
				// const last_yesterday_price = par
				const yesterday_last_price = parseFloat(last_yesterday_trade?.price) || 0;
				const trades_last_day = await this.getTradesLastDay(contract_name);
				const today_last_price = parseFloat(trades_last_day[0]?.price);
				const { base_volume, volume, high, low } = this.calculateMetrics(trades_last_day);

				// log.log({trades_last_day})
				token_metrics_entity.Volume = trades_last_day.length ? volume : 0;
				token_metrics_entity.BaseVolume = trades_last_day.length ? base_volume : 0;
				token_metrics_entity.High = trades_last_day.length ? high : yesterday_last_price;
				token_metrics_entity.Low = trades_last_day.length ? low : yesterday_last_price;
				token_metrics_entity.PrevDay = yesterday_last_price || 0;
				token_metrics_entity.TimeStamp = Date.now();
				token_metrics_entity.Last = trades_last_day.length ? today_last_price : yesterday_last_price;
				token_metrics_entity.Bid = trades_last_day.length ? today_last_price : yesterday_last_price;
				token_metrics_entity.Ask = trades_last_day.length ? today_last_price : yesterday_last_price;
				token_metrics_entity.PercentPriceIncrease_24h =
					((token_metrics_entity.Last - token_metrics_entity.PrevDay) / token_metrics_entity.PrevDay) * 100;
				proms.push(token_metrics_entity.save());
			}
			await Promise.all(proms);
		} catch (err) {
			log.error(err);
		}
	}

	private async getTradesLastDay(contract_name: string) {
		const one_day_ago = Date.now() / 1000 - 24 * 60 * 60;
		// const one_day_ago = Date.now() / 1000 - 24;
		const trade_history = await TradeHistoryEntity.find({
			where: { contract_name, time: MoreThan(one_day_ago) },
			order: { time: "DESC" }
		});
		// log.log({ trade_history });
		return trade_history;
	}

	private async getLastYesterdayTrade(contract_name: string) {
		const one_day_ago = Date.now() / 1000 - 24 * 60 * 60;
		// const one_day_ago = Date.now() / 1000 - 24;
		let yesterday = await TradeHistoryEntity.findOne({
			where: { contract_name, time: LessThan(one_day_ago) },
			order: { time: "DESC" }
		});
		if (!yesterday) {
			let trades_last_day = await this.getTradesLastDay(contract_name);
			yesterday = trades_last_day[0];
		}
		// log.log({ yesterday });
		return yesterday;
	}

	private calculateMetrics(trades: TradeHistoryEntity[]) {
		return trades.reduce(
			(accum, trade) => {
				let price = parseFloat(trade.price);
				let amount = parseFloat(trade.amount);
				accum.base_volume = accum.base_volume ? (accum.base_volume += amount * price) : amount * price;
				accum.volume = accum.volume ? (accum.volume += amount) : amount;
				accum.high = accum.high ? (price >= accum.high ? price : accum.high) : price;
				accum.low = accum.low ? (price <= accum.low ? price : accum.low) : price;
				return accum;
			},
			{ base_volume: undefined, volume: undefined, high: undefined, low: undefined }
		);
	}
}
