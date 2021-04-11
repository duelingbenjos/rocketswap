import { Entity, Column, PrimaryColumn, BaseEntity } from "typeorm";
import { handleClientUpdateType, TauUsdPriceUpdateType } from "src/types/websocket.types";
import { log } from "../utils/logger";

/** These are tokens added by watching the submission contract / submit_contract fn */

@Entity()
export class TauMarketEntity extends BaseEntity {
	@PrimaryColumn()
	info_type: string;

	@Column()
	value: string;
}

export async function saveUSDPrice(args: { price: string; handleClientUpdate: handleClientUpdateType }) {
	const { price, handleClientUpdate } = args;
	log.log("SAVE USD PRICE CALLED", price);
	let entity = await TauMarketEntity.findOne("usd_price");
	if (!entity) {
		entity = new TauMarketEntity();
		entity.info_type = "usd_price";
	}
	log.log({ entity });
	// if (price !== entity.value) {
	entity.value = price;
	await entity.save();
	const payload: TauUsdPriceUpdateType = {
		action: "tau_usd_price",
		price
	};
	handleClientUpdate(payload);
	// }
}
