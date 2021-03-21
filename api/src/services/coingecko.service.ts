import axios from "axios";
import { saveUSDPrice, TauMarketEntity } from '../entities/tau-market.entity'
import { SocketService } from "../socket.service";
import {log} from '../utils/logger'

/** Singleton Service */

export class CoinGeckoAPIService {
    private baseUrl = "https://api.coingecko.com/api/v3"
    private timeInterval = 60000 // 30 seconds
    private timer = null;

	constructor(private readonly socketService: SocketService) {
        this.getTauUSDPrice()
        this.timer = setInterval(this.getTauUSDPrice.bind(this), this.timeInterval)
    }
    private getExchangeTickers(exchange, coinIDs){
        return axios.get(`${this.baseUrl}/exchanges/${exchange}/tickers?coin_ids=${coinIDs}`).catch(err => console.log(err))
    }

    private async getTauUSDPrice(){
			try {
        let tickerData: any = await this.getExchangeTickers('txbit', 'lamden')
        tickerData?.data?.tickers.map(async (ticker) => {
            if (ticker.market.name === "Txbit") {
                let UsdPrice = ticker.converted_last.usd.toString()
                await saveUSDPrice({
                    price: UsdPrice,
                    handleClientUpdate: this.socketService.handleClientUpdate
                })
                let entity = await TauMarketEntity.findOne({info_type: "usd_price"})
                // console.log(entity)
            }
        })
			} catch (err) {
				log.console.error();
				(err)
			}
    }
}
