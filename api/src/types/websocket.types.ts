import { PriceEntity } from "src/entities/price.entity";

export type ClientUpdateType = PriceUpdateType;

export type PriceUpdateType = {
	action: "price_update";
	contract_name: string;
	price: number;
	time: number;
};

export function isPriceUpdate(client_update: ClientUpdateType): client_update is PriceUpdateType {
    return (client_update as PriceUpdateType).action === 'price_update'
  }
