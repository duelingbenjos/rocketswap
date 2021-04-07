import { Entity, Column, BaseEntity, PrimaryGeneratedColumn, PrimaryColumn } from "typeorm";

/** Based on the TXBIT.io API, for compatibility with coingecko
 * https://apidocs.txbit.io/#public-getmarketsummary
 */

// [
// 	{
// 		MarketName: "XLR/TAU",
// 		High: 0.00024857,
// 		Low: 0.00024857,
// 		Volume: 3.0, // RAW VOLUME OF TOKEN TRADED
// 		Last: 0.00024857, // LAST PRICE
// 		BaseVolume: 0.00074571, // VOLUME TRADED IN TERMS OF TAU
// 		TimeStamp: "2019-01-05T20:57:46.613Z",
// 		Bid: 0.00024856,
// 		Ask: 0.00024858,
// 		PrevDay: 0.00024857, // LAST PRICE FROM PREVIOUS DAY
// 		PrevWeek: 0.00024857, // LAST PRICE ONE WEEK AGO
// 		Created: "2018-12-06T12:53:31.16Z", // DAY MARKET CREATED
// 		DisplayMarketName: "Solaris - TAU"
// 	}
// ];

@Entity()
export class VolumeMetricsEntity extends BaseEntity {
	@PrimaryColumn()
	contract_name: string;

	@Column({ nullable: true })
	token_symbol: string;

	@Column({ nullable: true })
	Last: number;

	@Column({ nullable: true })
	Bid: number;

	@Column({ nullable: true })
	Ask: number;

	@Column({ nullable: true })
	TimeStamp: number; // Using UNIX for the moment, might need to change

	@Column({ nullable: true })
	MarketName: string; // TAU/RSWP

	@Column({ nullable: true })
	Volume: number; // Volume

	@Column({ nullable: true })
	PrevDay: number; // Price previous day

	@Column({ nullable: true })
	BaseVolume: number;

	@Column({ nullable: true })
	High: number;

	@Column({ nullable: true })
	Low: number;
}
