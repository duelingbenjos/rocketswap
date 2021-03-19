import {
	Entity,
    Column,
    PrimaryColumn,
	BaseEntity,
} from "typeorm";
import { handleClientUpdateType, TauUsdPriceUpdateType } from "src/types/websocket.types";

/** These are tokens added by watching the submission contract / submit_contract fn */

@Entity()
export class TauMarketEntity extends BaseEntity {
	@PrimaryColumn()
    info_type: string;
    
    @Column()
    value: string;
}

export async function saveUSDPrice (args : {
    price: string
    handleClientUpdate: handleClientUpdateType
}){
    const { price, handleClientUpdate } = args
    let entity = await TauMarketEntity.findOne({info_type: "usd_price"});
    if (!entity) {
        entity = new TauMarketEntity();
        entity.info_type = "usd_price";
    }
	entity.value = price;
    await entity.save();

    const payload: TauUsdPriceUpdateType = {
        action: "tau_usd_price",
        price
    };
    
    handleClientUpdate(payload)
};
