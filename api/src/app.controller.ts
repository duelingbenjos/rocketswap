import { Controller, Get, HttpException, Param, Post, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { AmmMetaEntity } from "./entities/amm-meta.entity";
import { BalanceEntity } from "./entities/balance.entity";
import { LpPointsEntity } from "./entities/lp-points.entity";
import { MarketcapEntity } from "./entities/marketcap.entity";
import { PairEntity } from "./entities/pair.entity";
import { StakingMetaEntity } from "./entities/staking-meta.entity";
import { TokenEntity } from "./entities/token.entity";
import { TradeHistoryEntity } from "./entities/trade-history.entity";
import { VolumeMetricsEntity } from "./entities/volume-metrics.entity";
import { GetBalancesDTO, GetMarketSummaryDTO, GetPairsInfoDTO, GetTokenDTO, GetTradeHistoryDTO, GetUserLpBalanceDTO } from "./types/dto";
import { log } from "./utils/logger";
import { decideLogo } from "./utils/utils";

@Controller("api")
@ApiTags("Main API")
export class AppController {
	constructor() {}

	@Get("amm_meta")
	public async getAmmMeta() {
		try {
			const amm_meta_entity = await AmmMetaEntity.findOne();
			if (!amm_meta_entity) throw "AMM Meta Entity does not exist";
			return amm_meta_entity;
		} catch (err) {
			throw new HttpException(err, 500);
		}
	}

	@Get("staking_meta")
	public async getStakingMeta() {
		try {
			log.log(process.env.STAKING_CONTRACTS);
			const ents = await StakingMetaEntity.find();
			return {
				env: process.env.STAKING_CONTRACTS,
				ents
			};
		} catch (err) {
			throw new HttpException(err, 500);
		}
	}

	@Get("get_market_summary")
	public async getMarketSummary(@Query() params: GetMarketSummaryDTO) {
		const { market_name } = params;
		try {
			return await VolumeMetricsEntity.findOne(market_name);
		} catch (err) {
			log.error(err);
		}
	}

	@Get("get_market_summaries")
	public async getMarketSummaries() {
		try {
			return await VolumeMetricsEntity.find();
		} catch (err) {
			log.error(err);
		}
	}

	@Get("get_market_summaries_w_token")
	public async getMarketSummariesWToken() {
		try {
			return await VolumeMetricsEntity.find({relations:['token']});
		} catch (err) {
			log.error(err);
		}
	}

	@Get("get_trade_history")
	public async getTradeHistory(@Query() params: GetTradeHistoryDTO) {
		let { vk, contract_name, skip, take } = params;
		if (!take) take = 50;
		const find_options = { where: {} };

		if (vk) find_options["where"]["vk"] = vk;
		if (contract_name) find_options["where"]["contract_name"] = contract_name;
		if (skip) find_options["skip"] = skip;
		if (take) {
			take = take > 50 ? 50 : take;
			find_options["take"] = take;
		}

		try {
			return await TradeHistoryEntity.find({
				select: ["contract_name", "token_symbol", "price", "type", "time"],
				order: { time: "DESC" },
				...find_options
			});
		} catch (err) {
			throw new HttpException(err, 500);
		}
	}

	@Get("token_list")
	public async getTokenList() {
		try {
			const res = await TokenEntity.find({
				select: [
					"contract_name",
					"has_market",
					"token_base64_png",
					"token_base64_svg",
					"token_logo_url",
					"token_name",
					"token_symbol"
				]
			});

			return res
				.filter((token) => {
					return token.token_symbol && token.token_name;
				})
				.map((token) => {
					return {
						contract_name: token.contract_name,
						has_market: token.has_market,
						token_base64_png: token.token_base64_png,
						token_base64_svg: token.token_base64_svg,
						logo: decideLogo(token),
						token_logo_url: token.token_logo_url,
						token_name: token.token_name,
						token_symbol: token.token_symbol
					};
				});
		} catch (err) {
			throw new HttpException(err, 500);
		}
	}

	@Get("token/:contract_name")
	public async getToken(@Param() params: GetTokenDTO) {
		const { contract_name } = params;
		try {
			let token = await TokenEntity.findOne({ where: { contract_name } });
			// let token = tokenRes[tokenRes.length - 1];
			let lp_info = await PairEntity.findOne({ where: { contract_name } });
			return { token, lp_info };
		} catch (err) {
			throw new HttpException(err, 500);
		}
	}

	@Get("market_list")
	public async getMarketList() {
		try {
			return await TokenEntity.find({ where: { has_market: true } });
		} catch (err) {
			throw new HttpException(err, 500);
		}
	}

	@Get("user_lp_balance/:vk")
	public async getUserLpBalance(@Param() params: GetUserLpBalanceDTO) {
		const { vk } = params;
		//console.log(vk)
		try {
			const res = await LpPointsEntity.findOne(vk);
			// console.log(res)
			return res;
		} catch (err) {
			throw new HttpException(err, 500);
		}
	}

	@Get("get_pairs/:contract_names")
	public async getPairsInfo(@Param() params: GetPairsInfoDTO) {
		const { contract_names } = params;
		const contract_names_arr = contract_names.split(",");
		if (!contract_names_arr.length) throw "Invalid contract_names provided.";
		try {
			if (contract_names_arr.length > 20) {
				throw "You may only request a maximum of 20 pairs at a time.";
			}
			const pair_proms: Promise<PairEntity>[] = contract_names_arr.map((contract_name) => {
				return new Promise(async (resolve) => {
					let tokenRes = await TokenEntity.findOne({
						contract_name
					});
					let pairRes = await PairEntity.findOne(contract_name);
					resolve(Object.assign(pairRes, tokenRes));
				});
			});
			const res = await Promise.all(pair_proms);
			const res_obj = {};
			res.forEach((pair) => {
				if (pair) res_obj[pair.contract_name] = pair;
			});
			return res_obj;
		} catch (err) {
			throw new HttpException(err, 500);
		}
	}

	@Get("balances/:vk")
	async getBalances(@Param() params: GetBalancesDTO): Promise<any> {
		try {
			let balances: any = await BalanceEntity.findOne(params.vk);
			if (!balances)
				balances = {
					vk: params.vk,
					balances: {}
				};
			return balances;
		} catch (err) {
			throw new HttpException(err, 500);
		}
	}

	@Get("marketcaps")
	async getMarketcaps() {
		try {
			return await MarketcapEntity.find();
		} catch (err) {
			throw new HttpException(err, 500);
		}
	}
}
