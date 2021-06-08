import { Injectable, OnModuleInit } from "@nestjs/common";
import { log } from "../utils/logger";
import { TokenEntity } from "../entities/token.entity";
import { config, staking_contracts } from "../config";
import { MarketcapEntity } from "../entities/marketcap.entity";
import { BalanceEntity } from "../entities/balance.entity";
import { ParserProvider } from "../parser.provider";
import { PairEntity } from "../entities/pair.entity";
import { CoinGeckoAPIService } from "./coingecko.service";
import { StakingMetaEntity } from "../entities/staking-meta.entity";

@Injectable()
export class MarketcapService implements OnModuleInit {
	async onModuleInit() {
		await this.updateMarketCaps();
		setInterval(
			async () => {
				await this.updateMarketCaps();
			},
			60 * 1000 // 1 min
		);
	}

	private async updateMarketCaps() {
		try {
			const tokens = await TokenEntity.find({ where: { has_market: true } });
			const proms: Promise<any>[] = [];
			for (let token of tokens) {
				const { contract_name } = token;

				let prom_1 = await MarketcapEntity.findOne(contract_name);
				let prom_2 = await PairEntity.findOne(contract_name);
				let [marketcap_entity, pair_entity] = await Promise.all([prom_1, prom_2]);
				if (!marketcap_entity) {
					marketcap_entity = new MarketcapEntity();
					marketcap_entity.contract_name = contract_name;
					marketcap_entity.base_supply = Number(token.base_supply);
				}
				marketcap_entity.token_symbol = token.token_symbol;
				marketcap_entity.circulating_supply = await calculateCirculatingSupply(token);
				marketcap_entity.marketcap_tau = Number(pair_entity.price) * marketcap_entity.circulating_supply;
				marketcap_entity.marketcap_usd = marketcap_entity.marketcap_tau * CoinGeckoAPIService.last_price;
				proms.push(marketcap_entity.save());
			}
			const market_caps = await Promise.all(proms);
			// log.log({ market_caps });
		} catch (err) {
			log.error(err);
		}
	}
}

async function calculateCirculatingSupply(token: TokenEntity) {
	const dev_wallet = await BalanceEntity.findOne(token.developer);
	let circulating_supply = Number(token.base_supply) - Number(dev_wallet.balances[token.contract_name]);
	let circulating_in_staking_contract = 0;

	const staking_contracts = await StakingMetaEntity.find({
		where: [{ STAKING_TOKEN: token.contract_name }, { YIELD_TOKEN: token.contract_name }]
	});

	/** Find all staking contracts with token as reward
	 * 	remove this value from the circulating supply
	 */

	const staking_contracts_token_yield = staking_contracts.filter((contract) => contract.STAKING_TOKEN === token.contract_name);

	const proms = [];
	staking_contracts_token_yield.forEach((staking_meta) => {
		proms.push(BalanceEntity.findOne(staking_meta.contract_name));
	});
	const staking_contract_balances = await Promise.all(proms);

	staking_contract_balances.forEach((staking_balance) => {
		if (staking_balance?.balances && staking_balance.balances[token.contract_name]) {
			circulating_supply -= Number(staking_balance.balances[token.contract_name]);
		}
	});

	/** Find all staking contracts with token as staking and yield collateral
	 * 	add this value to the circulating supply
	 */

	const staking_contracts_token_staking = staking_contracts.filter(
		(contract) => contract.YIELD_TOKEN === contract.STAKING_TOKEN && contract.YIELD_TOKEN === token.contract_name
	);

	staking_contracts_token_staking.forEach((staking_meta) => {
		circulating_supply += staking_meta.StakedBalance;
	});

	return circulating_supply;
}
