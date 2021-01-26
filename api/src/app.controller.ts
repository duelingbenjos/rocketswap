import { Controller, Get, HttpException, Param, Query } from "@nestjs/common";
import { BalanceEntity } from "./entities/balance.entity";
import { LpPointsEntity } from "./entities/lp-points.entity";
import { PairEntity } from "./entities/pair.entity";
import { TokenEntity } from "./entities/token.entity";
import { TradeHistoryEntity } from "./entities/trade-history.entity";

@Controller("api")
export class AppController {
	constructor() {}

	@Get("trade_history")
	public async getTradeHistory(@Param() params) {
		const { vk, contract_name, index } = params;
		const find_options = {};
		try {
			return await TradeHistoryEntity.find();
		} catch (err) {
			throw new HttpException(err, 500);
		}
	}

	@Get("get_trade_history")
	public async test(@Query() params) {
		let { vk, contract_name, skip, take } = params;
		let select = ["contract_name", "token_symbol"];
		const find_options = { where: {} };

		if (vk) find_options["where"]["vk"] = vk;
		if (contract_name)
			find_options["where"]["contract_name"] = contract_name;
		if (skip) find_options["skip"] = skip;
		if (take) {
			take = take > 50 ? 50 : take;
			find_options["take"] = take;
		}

		try {
			return await TradeHistoryEntity.find({
				select: [
					"contract_name",
					"token_symbol",
					"price",
					"type",
					"time"
				],
				...find_options
			});
		} catch (err) {
			throw new HttpException(err, 500);
		}
	}

	@Get("token_list")
	public async getTokenList() {
		try {
			return await TokenEntity.find();
		} catch (err) {
			throw new HttpException(err, 500);
		}
	}

	@Get("token/:contract_name")
	public async getToken(@Param() params) {
		const { contract_name } = params;
		try {
			let tokenRes = await TokenEntity.find({ contract_name });
			let token = tokenRes[tokenRes.length - 1];
			let lp_info = await PairEntity.findOne(contract_name);
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
	public async getUserLpBalance(@Param() params) {
		const { vk } = params;
		//console.log(vk)
		try {
			return await LpPointsEntity.findOneOrFail(vk);
		} catch (err) {
			throw new HttpException(err, 500);
		}
	}

	@Get("get_pairs/:contract_names")
	public async getPairsInfo(@Param() params) {
		const { contract_names } = params;
		const contract_names_arr = contract_names.split(",");
		try {
			if (contract_names_arr.length > 20) {
				throw "You may only request a maximum of 20 pairs at a time.";
			}
			const pair_proms: Promise<PairEntity>[] = contract_names_arr.map(
				(contract_name) => {
					return new Promise(async (resolve) => {
						let tokenRes = await TokenEntity.findOne({
							contract_name
						});
						let pairRes = await PairEntity.findOne(contract_name);
						resolve(Object.assign(pairRes, tokenRes));
					});
				}
			);
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
	async getBalances(@Param() params): Promise<any> {
		try {
			let balances: any = await BalanceEntity.findOne(params.vk);
			if (!balances)
				balances = {
					vk: params.vk,
					balances: {}
				};
			return balances;
		} catch (err) {
			console.error(err);
			throw new HttpException(err, 500);
		}
	}

	// @Get("all_balances")
	// async getAllBalances(): Promise<any> {
	// 	try {
	// 		let balances: any = await BalanceEntity.find();
	// 		return balances;
	// 	} catch (err) {
	// 		console.error(err);
	// 		throw new HttpException(err, 500);
	// 	}
	// }
}
