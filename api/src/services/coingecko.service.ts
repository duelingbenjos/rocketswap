import axios from "axios";
import { saveUSDPrice, TauMarketEntity } from "../entities/tau-market.entity";
import { SocketService } from "./socket.service";
import { log } from "../utils/logger";
import { Injectable, OnModuleInit } from "@nestjs/common";

@Injectable()
export class CoinGeckoAPIService implements OnModuleInit {
	public static last_price: number = 0;
	private baseUrl = "https://api.coingecko.com/api/v3";
	private timeInterval = 30000; // 30 seconds

	constructor(private readonly socketService: SocketService) {}

	async onModuleInit() {
		await this.getTauUSDPrice();
		setInterval(async () => {
			await this.getTauUSDPrice();
		}, 5000);
	}

	private getTauUSDPrice = async () => {
		try {
			let tickerData: any = await axios.get(`${this.baseUrl}/exchanges/${"txbit"}/tickers?coin_ids=${"lamden"}`);
			const eth_tau_ticker = tickerData.data?.tickers?.find((ticker) => ticker.target === "ETH");
			log.log({ eth_tau_ticker });
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
}
