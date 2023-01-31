import axios from "axios";
import { saveUSDPrice } from "../entities/tau-market.entity";
import { SocketService } from "./socket.service";
import { log } from "../utils/logger";
import { Injectable, OnModuleInit } from "@nestjs/common";
import { PairEntity } from "../entities/pair.entity";
import { config } from "../config";

@Injectable()
export class CoinGeckoAPIService implements OnModuleInit {
	public static last_price: number = 0;
	private baseUrl = "https://api.coingecko.com/api/v3";
	private timeInterval = 60000; // 60 seconds

	constructor(private readonly socketService: SocketService) { }

	async onModuleInit() {
		await this.syncTauUsdcPrice();
		setInterval(async () => {
			await this.syncTauUsdcPrice();
		}, this.timeInterval);
	}

	private syncTauUsdcPrice = async () => {
		try {
			let tickerData: any = await axios.get(`https://api.coingecko.com/api/v3/exchanges/kraken/tickers?coin_id=usdc`);
			const usdc_usd_ticker = tickerData.data?.tickers?.find((ticker) => ticker.target === "USD" && ticker.base === "USDC");
			const last_price_usdc_usd = usdc_usd_ticker?.last;
			const timestamp = usdc_usd_ticker?.timestamp
			if (last_price_usdc_usd && timestamp) {
				const tau_lusd_last = (await PairEntity.findOne(config.lusd_token)).price
				const tau_usdc_price = (Number(tau_lusd_last) * last_price_usdc_usd).toString()
				log.log(`latest TAU/LUSD price is : $ ${1 / Number(tau_usdc_price)}`)
				return await saveUSDPrice({
					price: String(1 / Number(tau_usdc_price)),
					handleClientUpdate: this.socketService.handleClientUpdate
				});
			} else {
				throw ("could not retrieve last_price / timestamp")
			}
		} catch (err) {
			const err_response = err.response ? err.response.statusText || err.response : err;
			log.warn(`could not retrieve USDC price`);
			log.warn(err_response)
		}
	};

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