import { Controller, Get, HttpException, Param } from "@nestjs/common";
import { HttpErrorByCode } from "@nestjs/common/utils/http-error-by-code.util";
import { BalanceEntity } from "./entities/balance.entity";
import { TokenEntity } from "./entities/token.entity";

@Controller("api")
export class AppController {
	constructor() {}
	@Get("token_list")
	public async getTokenList() {
		try {
			return await TokenEntity.find();
		} catch (err) {
			throw new HttpException(err, 500);
		}
	}

	@Get("balances/:vk")
	async getBalances(@Param() params): Promise<any> {
		try {
			let balances: any = await BalanceEntity.findOne(params.vk);
			if (!balances) balances = [];
			return balances;
		} catch (err) {
			console.error(err);
			throw new HttpException(err, 500);
		}
	}

	@Get("all_balances")
	async getAllBalances(): Promise<any> {
		try {
			let balances: any = await BalanceEntity.find();
			return balances;
		} catch (err) {
			console.error(err);
			throw new HttpException(err, 500);
		}
	}
}
