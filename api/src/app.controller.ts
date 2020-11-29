import { Controller, Get, HttpException } from "@nestjs/common";
import { HttpErrorByCode } from "@nestjs/common/utils/http-error-by-code.util";
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
}
