import { IContractingTime, IKvp } from "../types/misc.types";
import { handleClientUpdateType, IUserYieldInfo } from "../types/websocket.types";
import { log } from "../utils/logger";
import { Entity, Column, BaseEntity, PrimaryGeneratedColumn } from "typeorm";
import { StakingEpochEntity } from "./staking-epoch.entity";
import { StakingMetaEntity } from "./staking-meta.entity";
import { calculateSimpleYield, calculateSmartCompoundingYield, calculateSmartEpochYield } from "../utils/yield-utils";

@Entity()
export class UserStakingEntity extends BaseEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	vk: string;

	@Column()
	staking_contract: string;

	@Column({ nullable: true, type: "simple-json" })
	deposits: IStakingDeposit[];

	@Column({ nullable: true })
	withdrawals: number;

	@Column({ nullable: true, type: "simple-json" })
	yield_info: IUserYieldInfo;
}

export interface IStakingDeposit {
	amount: { __fixed__: string };
	starting_epoch: number;
	time: IContractingTime;
	step_offset?: {
		__delta__: [number, number];
	};
}

export async function updateUserStakingInfo(args: {
	deposits: IKvp | undefined;
	withdrawals: IKvp | undefined;
	staking_contract: string;
	fn: string;
	handleClientUpdate: handleClientUpdateType;
}) {
	const { deposits, withdrawals, staking_contract, fn, handleClientUpdate } = args;
	const vk = deposits ? deposits.key.split(":")[1] : withdrawals.key.split(":")[1];
	let entity = await UserStakingEntity.findOne({ where: { vk, staking_contract } });
	if (!entity) {
		entity = new UserStakingEntity();
		entity.deposits = [];
		entity.withdrawals = 0;
		entity.vk = vk;
		entity.staking_contract = staking_contract;
	}
	if (deposits?.value) {
		if (deposits.value.length) {
			entity.deposits = deposits.value.map((deposit) => {
				if (deposit.starting_epoch.__fixed__) deposit.starting_epoch = Number(deposit.starting_epoch.__fixed__);
				return deposit;
			});
		} else if (deposits.value.starting_epoch) {
			if (deposits.value.starting_epoch.__fixed__) deposits.value.starting_epoch = Number(deposits.value.starting_epoch.__fixed__);
			entity.deposits = [deposits.value];
		}
	}
	if (withdrawals) {
		entity.withdrawals = withdrawals.value.__fixed__ ? parseFloat(withdrawals.value.__fixed__) : 0;
	}
	if (fn === "withdrawTokensAndYield") {
		entity.withdrawals = 0;
		entity.deposits = [];
		entity.yield_info = null;
	}
	handleClientUpdate({ action: "client_staking_update", staking_contract });
	return await entity.save();
}

export function getUserYield(args: { meta: StakingMetaEntity; user: UserStakingEntity; epochs: StakingEpochEntity[] }) {
	let { meta, user, epochs } = args;
	let { DevRewardPct } = meta;
	let { deposits, withdrawals } = user;
	
	let harvestable_yield = 0;
	for (let d of deposits) {
		let calcFn: Function;
		let staking_contract_type = meta.meta?.type;

		if (!staking_contract_type) {
			log.error("no meta info found");
			return;
		}
		if (staking_contract_type === "staking_simple") {
			calcFn = calculateSimpleYield;
		} else if (staking_contract_type === "staking_smart_epoch_compounding_timeramp") {
			calcFn = calculateSmartCompoundingYield;
		} else if (staking_contract_type === "staking_smart_epoch") {
			calcFn = calculateSmartEpochYield;
		}
		if (meta.contract_name === "con_rswp_compounding_01") {
			// log.log({ meta });
		}
		harvestable_yield += calcFn({
			starting_epoch_index: d.starting_epoch,
			amount: d.amount,
			deposit_start_time: d.time,
			current_epoch_index: meta.Epoch.index,
			epochs,
			meta,
			step_offset: d.step_offset?.__delta__
		}); 
	}

	harvestable_yield -= withdrawals;
	const dev_share = harvestable_yield * DevRewardPct;
	return harvestable_yield - dev_share;
}
