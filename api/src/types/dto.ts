import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class GetTradeHistoryDTO {
	@ApiPropertyOptional()
	vk?: string;

	@ApiPropertyOptional()
	contract_name?: string;

	@ApiPropertyOptional()
	skip?: number;

	@ApiPropertyOptional()
	take?: number;
}

export class GetMarketSummaryDTO {
	@ApiProperty()
	contract_name: string;

}

export class GetTokenDTO {
	@ApiProperty()
	contract_name: string;
}

export class GetUserLpBalanceDTO {
	@ApiProperty()
	vk: string;
}

export class GetPairsInfoDTO {
	@ApiProperty()
	contract_names: string;
}

export class GetBalancesDTO {
	@ApiProperty()
	vk: string;
}

export class GetUserStakingInfoDTO {
	@ApiProperty()
	vk: string;
}

export class IBlockServiceProxyReq {
	@ApiProperty()
	action_name: string; // the name of your action
	@ApiProperty()
	args: (string | number)[];
}

// export class GetMarketcapsDTO {
//     @ApiProperty()

// }



