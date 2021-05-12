import axios, { AxiosResponse } from "axios";

async function main() {
	try {
		// const market_summaries_res: any = await axios.get("https://rocketswap.exchange:2053/api/get_market_summaries");
		let volume = 0;
		// for (let market of market_summaries_res.data) {
		let trades = await getTrades("con_stubucks");
		trades.forEach((trade: any) => {
			volume += parseFloat(trade.amount) * parseFloat(trade.price);
		});
		// }
		console.log({ volume });
	} catch (err) {
		console.error(err);
	}
}

async function getTrades(contract_name: string, skip: number = 0, results: any[] = []): Promise<any> {
	const res: any = await axios.get(
		`https://rocketswap.exchange:2053/api/get_trade_history?contract_name=${contract_name}&skip=${skip}&take=50`
	);
	results.push(...res.data);
	if (res.data.length === 50) {
		return await getTrades(contract_name, skip + 50, results);
	} else {
		return results;
	}
}

Promise.resolve(main());
