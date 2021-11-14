import { IKvp } from "src/types/misc.types";
import { getNumber, getVal, getValue } from "../utils/utils";
import { config } from "../config";
import { Entity, Column, BaseEntity, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { handleClientUpdateType } from "../types/websocket.types";
import { getContractState } from "../utils/block-service-utils";
import { log } from "../utils/logger";
import { LpPointsEntity } from "./lp-points.entity";
import { PairEntity } from "./pair.entity";

@Entity()
export class AmmMetaEntity extends BaseEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ nullable: true })
	FEE_PERCENTAGE: string;

	@Column({ nullable: true })
	TOKEN_CONTRACT: string;

	@Column({ nullable: true })
	TOKEN_DISCOUNT: string;

	@Column({ nullable: true })
	BURN_PERCENTAGE: string;

	@Column({ nullable: true })
	BURN_ADDRESS: string;

	@Column({ nullable: true })
	LOG_ACCURACY: string;

	@Column({ nullable: true })
	MULTIPLIER: string;

	@Column({ nullable: true })
	OWNER: string;

	@Column({ nullable: true })
	__developer__: string;
}


export const updateAmmMeta = async (args: { state: IKvp[]; handleClientUpdate: handleClientUpdateType }) => {
	const { state, handleClientUpdate } = args;

	let entity = await AmmMetaEntity.findOne();
	if (!entity) entity = new AmmMetaEntity();
	state.forEach((kvp) => {
		switch (kvp.key) {
			case `${config.amm_contract}.state:FEE_PERCENTAGE`:
				entity["FEE_PERCENTAGE"] = getVal(kvp);
				break;
			case `${config.amm_contract}.state:TOKEN_CONTRACT`:
				entity["TOKEN_CONTRACT"] = getVal(kvp);
				break;
			case `${config.amm_contract}.state:TOKEN_DISCOUNT`:
				entity["TOKEN_DISCOUNT"] = getVal(kvp);
				break;
			case `${config.amm_contract}.state:BURN_PERCENTAGE`:
				entity["BURN_PERCENTAGE"] = getVal(kvp);
				break;
			case `${config.amm_contract}.state:BURN_ADDRESS`:
				entity["BURN_ADDRESS"] = getVal(kvp);
				break;
			case `${config.amm_contract}.state:LOG_ACCURACY`:
				entity["LOG_ACCURACY"] = getVal(kvp);
				break;
			case `${config.amm_contract}.state:MULTIPLIER`:
				entity["MULTIPLIER"] = getVal(kvp);
				break;
			case `${config.amm_contract}.state:OWNER`:
				entity["OWNER"] = getVal(kvp);
				break;
			case `${config.amm_contract}.__developer__`:
				entity["__developer__"] = getVal(kvp);
				break;
		}
	});
	await entity.save();
};

export const syncAmmCurrentState = async () => {
	const current_state = await getContractState(config.amm_contract);
	const amm_state = current_state[config.amm_contract];

	if (amm_state) {
		const { discount, lp_points, reserves, staked_amount, state: amm_meta } = amm_state;
		await syncLpPointsEntities(lp_points);
		await syncPairEntities(reserves);
		await syncAmmMeta(amm_meta);
	}
};

export const syncAmmMeta = async (amm_meta: IAmmMetaState) => {
	const ent = new AmmMetaEntity();
	ent.TOKEN_DISCOUNT = getValue(amm_meta.TOKEN_DISCOUNT);
	ent.MULTIPLIER = getValue(amm_meta.MULTIPLIER);
	ent.OWNER = amm_meta.OWNER;
	ent.TOKEN_CONTRACT = amm_meta.TOKEN_CONTRACT;
	ent.__developer__ = amm_meta.OWNER;
	ent.BURN_ADDRESS = amm_meta.BURN_ADDRESS;
	ent.BURN_PERCENTAGE = getValue(amm_meta.BURN_PERCENTAGE);
	ent.LOG_ACCURACY = getValue(amm_meta.LOG_ACCURACY);
	ent.FEE_PERCENTAGE = getValue(amm_meta.FEE_PERCENTAGE);
	await ent.save();
};

export const syncLpPointsEntities = async (lp_points_state: ILpPointsState) => {
	const contract_keys = Object.keys(lp_points_state);
	for (let contract of contract_keys) {
		const contract_obj = lp_points_state[contract];
		const address_keys = Object.keys(contract_obj);
		for (let vk of address_keys) {
			const lp_value = getValue(contract_obj[vk]);
			let lp_points_entity = await LpPointsEntity.findOne(vk);
			if (!lp_points_entity) {
				lp_points_entity = new LpPointsEntity();
				lp_points_entity.vk = vk;
				lp_points_entity.points = {};
			}
			lp_points_entity.points[contract] = String(lp_value);
			await lp_points_entity.save();
		}
	}
};

export const syncPairEntities = async (reserves_state: IReservesState) => {
	const lp_totals = await LpPointsEntity.findOne("__hash_self__");
	for (let contract of Object.keys(reserves_state)) {
		const reserves = reserves_state[contract];
		const ent = new PairEntity();
		ent.contract_name = contract;
		ent.lp = lp_totals.points[contract];
		ent.reserves = [getValue(reserves[0]), getValue(reserves[1])];
		ent.price = String(Number(ent.reserves[0]) / Number(ent.reserves[1]));
		await ent.save();
	}
};

interface IAmmMetaState {
	BURN_ADDRESS: string;
	BURN_PERCENTAGE: { __fixed__: string };
	DISCOUNT_FLOOR: { __fixed__: string };
	FEE_PERCENTAGE: { __fixed__: string };
	LOG_ACCURACY: { __fixed__: string };
	MULTIPLIER: { __fixed__: string };
	OWNER: string;
	TOKEN_CONTRACT: string;
	TOKEN_DISCOUNT: { __fixed__: string };
}

interface IReservesState {
	[key: string]: [{ __fixed__: string }, { __fixed__: string }];
}

interface ILpPointsState {
	[key: string]: {
		[key: string]: string | { __fixed__: string };
	};
}
