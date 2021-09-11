import axios from "axios";
import { saveUSDPrice, TauMarketEntity } from "../entities/tau-market.entity";
import { SocketService } from "./socket.service";
import { log } from "../utils/logger";
import { Injectable, OnModuleInit } from "@nestjs/common";
import { PairEntity } from "../entities/pair.entity";

@Injectable()
export class CoinGeckoAPIService implements OnModuleInit {
	public static last_price: number = 0;
	private baseUrl = "https://api.coingecko.com/api/v3";
	private timeInterval = 30000; // 30 seconds

	constructor(private readonly socketService: SocketService) {}

	async onModuleInit() {
		// await this.getTauUSDPrice();
		await this.getTauUSDGlobalPrice();
		setInterval(async () => {
			// await this.getTauUSDPrice();
			await this.getTauUSDPrice_rocketswap();
		}, this.timeInterval);
	}

	private getTauUSDTxbitPrice = async () => {
		try {
			let tickerData: any = await axios.get(`${this.baseUrl}/exchanges/${"txbit"}/tickers?coin_ids=${"lamden"}`);
			const eth_tau_ticker = tickerData.data?.tickers?.find((ticker) => ticker.target === "ETH");
			// log.log({ eth_tau_ticker });
			if (eth_tau_ticker && eth_tau_ticker.market.name === "Txbit") {
				let UsdPrice = eth_tau_ticker.converted_last.usd.toString();
				CoinGeckoAPIService.last_price = eth_tau_ticker.converted_last.usd;
				return await saveUSDPrice({
					price: UsdPrice,
					handleClientUpdate: this.socketService.handleClientUpdate
				});
			}
		} catch (err) {
			log.error(err);
		}
	};

	private getTauUSDGlobalPrice = async () => {
		try {
			let tickerData: any = await axios.get(
				`${this.baseUrl}/coins/markets?vs_currency=usd&ids=lamden&order=market_cap_desc&per_page=100&page=1&sparkline=false`
			);
			log.log(tickerData.data[0].current_price);
			const price = tickerData?.data[0].current_price;
			if (price) {
				return await saveUSDPrice({
					price: price.toString(),
					handleClientUpdate: this.socketService.handleClientUpdate
				});
			}
		} catch (err) {
			log.error(err);
		}
	};

	private getTauUSDPrice_rocketswap = async () => {
		let tickerData: any = await axios.get(`${this.baseUrl}/exchanges/${"binance"}/tickers?coin_ids=${"ethereum"}`);
		const eth_usd_ticker = tickerData.data?.tickers?.find((ticker) => ticker.target === "USDT");
		const last_price = eth_usd_ticker.last;
		const weth_pair = await PairEntity.findOne({ where: { token_symbol: "WETH" } });
		if (!weth_pair) return;
		const [tau_reserve, weth_reserve] = weth_pair.reserves;
		const tau_weth_price = Number(tau_reserve) / Number(weth_reserve);
		const tau_price_usd = (last_price / tau_weth_price).toString();
		return await saveUSDPrice({
			price: tau_price_usd,
			handleClientUpdate: this.socketService.handleClientUpdate
		});
	};
}
