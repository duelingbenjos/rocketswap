import { IContractingTime, IKvp } from "src/types/misc.types";
import { handleClientUpdateType, IUserYieldInfo } from "src/types/websocket.types";
import { Entity, Column, BaseEntity, PrimaryGeneratedColumn } from "typeorm";
import { StakingEpochEntity } from "./staking-epoch.entity";
import { StakingMetaEntity } from "./staking-meta.entity";

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

// current_yield, yield_per_sec, time_updated, epoch_updated

export interface IStakingDeposit {
	amount: { __fixed__: string };
	starting_epoch: number;
	time: IContractingTime;
}

export async function updateUserStakingInfo(args: {
	deposits: IKvp | undefined;
	withdrawals: IKvp | undefined;
	staking_contract: string;
	fn: string;
	handleClientUpdate: handleClientUpdateType
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
	if (deposits) {
		entity.deposits = deposits.value;
	}
	if (withdrawals) {
		entity.withdrawals = withdrawals.value.__fixed__ ? parseFloat(withdrawals.value.__fixed__) : 0;
		handleClientUpdate({action: "client_staking_update", staking_contract})
	}
	if (fn === "withdrawTokensAndYield") {
		entity.withdrawals = 0;
		entity.deposits = [];
		entity.yield_info = null;
	}

	return await entity.save();
}

export function getUserYield(args: { meta: StakingMetaEntity; user: UserStakingEntity; epochs: StakingEpochEntity[] }) {
	let { meta, user, epochs } = args;
	let { DevRewardPct } = meta;
	let { deposits, withdrawals } = user;

	let harvestable_yield = 0;

	for (let d of deposits) {
		let calcFn = meta.meta.type === 'simple_staking' ? calculateSimpleYield : calculateYield
		harvestable_yield += calcFn({
			starting_epoch_index: d.starting_epoch,
			amount: d.amount,
			deposit_start_time: d.time,
			current_epoch_index: meta.Epoch.index,
			epochs,
			meta
		});
	}

	//console.log("Harvestable Yield", harvestable_yield);
	// if (typeof withdrawals === 'object') withdrawals = 0
	harvestable_yield -= withdrawals;

	const dev_share = harvestable_yield * DevRewardPct;
	//console.log("-==== YIELD AND ALL HERE ====-");
	//console.log(dev_share, harvestable_yield, DevRewardPct);
	return harvestable_yield - dev_share;
}

function calculateYield(args: {
	starting_epoch_index: number;
	amount: any;
	deposit_start_time: IContractingTime;
	current_epoch_index: number;
	epochs: StakingEpochEntity[];
	meta: StakingMetaEntity;
}): number {
	//console.log("CALCULATE YIELD CALLED");
	let { starting_epoch_index, amount, deposit_start_time, current_epoch_index, epochs, meta } = args;

	// console.log(epochs);
	let start_time = datetimeToUnix(meta.StartTime);
	let end_time = datetimeToUnix(meta.EndTime);

	const fitTime = (time: number): number => {
		if (time < start_time) time = start_time;
		else if (time > end_time) time = end_time;
		return time;
	};

	amount = parseFloat(amount.__fixed__);
	let this_epoch_index = starting_epoch_index;
	let y = 0;

	while (this_epoch_index <= current_epoch_index) {
		let this_epoch = epochs[this_epoch_index];
		let next_epoch = epochs[this_epoch_index + 1];

		let delta = 0;

		if (starting_epoch_index === current_epoch_index) {
			delta = fitTime(Date.now()) - fitTime(datetimeToUnix(deposit_start_time));
		} else if (this_epoch_index === starting_epoch_index) {
			delta = fitTime(datetimeToUnix(next_epoch.time)) - fitTime(datetimeToUnix(deposit_start_time));
		} else if (this_epoch_index === current_epoch_index) {
			delta = fitTime(Date.now()) - fitTime(datetimeToUnix(this_epoch.time));
		} else {
			delta = fitTime(datetimeToUnix(next_epoch.time)) - fitTime(datetimeToUnix(this_epoch.time));
		}
		const delta_seconds = delta / 1000;
		let pct_share_of_stake = amount / this_epoch.amount_staked;
		let global_yield_this_epoch = delta_seconds * getEmissionRatePerSecond(meta.EmissionRatePerHour);
		let deposit_yield_this_epoch = global_yield_this_epoch * pct_share_of_stake;

		y += deposit_yield_this_epoch;
		this_epoch_index += 1;
	}
	//console.log("CALCULATED YIELD: ", y);
	return y;
}

function calculateSimpleYield(args: {
	starting_epoch_index: number;
	amount: any;
	deposit_start_time: IContractingTime;
	current_epoch_index: number;
	epochs: StakingEpochEntity[];
	meta: StakingMetaEntity;
}): number {
	//console.log("CALCULATE YIELD CALLED");
	let { starting_epoch_index, amount, deposit_start_time, current_epoch_index, epochs, meta } = args;

	// console.log(epochs);
	let start_time = datetimeToUnix(meta.StartTime);
	let end_time = datetimeToUnix(meta.EndTime);

	const fitTime = (time: number): number => {
		if (time < start_time) time = start_time;
		else if (time > end_time) time = end_time;
		return time;
	};

	amount = parseFloat(amount.__fixed__);
	let this_epoch_index = starting_epoch_index;
	let y = 0;

	while (this_epoch_index <= current_epoch_index) {
		let this_epoch = epochs[this_epoch_index];
		let next_epoch = epochs[this_epoch_index + 1];

		let delta = 0;

		if (starting_epoch_index === current_epoch_index) {
			delta = fitTime(Date.now()) - fitTime(datetimeToUnix(deposit_start_time));
		} else if (this_epoch_index === starting_epoch_index) {
			delta = fitTime(datetimeToUnix(next_epoch.time)) - fitTime(datetimeToUnix(deposit_start_time));
		} else if (this_epoch_index === current_epoch_index) {
			delta = fitTime(Date.now()) - fitTime(datetimeToUnix(this_epoch.time));
		} else {
			delta = fitTime(datetimeToUnix(next_epoch.time)) - fitTime(datetimeToUnix(this_epoch.time));
		}
		const delta_seconds = delta / 1000;

		// rswp_per_tau_per_second = EmissionRatePerTau.get() / 365 / 24 / 60 / 60
        
        // y += rswp_per_tau_per_second * amount * delta

        // this_epoch_index += 1
		let rswp_per_tau_per_second = meta.EmissionRatePerSecond


		y += rswp_per_tau_per_second * amount * delta_seconds;
		this_epoch_index += 1;
	}
	//console.log("CALCULATED YIELD: ", y);
	return y;
}


export function getUserYieldPerSecond(meta: StakingMetaEntity, total_staked: number) {
	const emission_rate_per_hour = meta.EmissionRatePerHour;
	const total_emission_rate_per_second = getEmissionRatePerSecond(emission_rate_per_hour);
	const share_of_pool = total_staked / meta.StakedBalance;
	const user_emission_rate_per_second = share_of_pool * total_emission_rate_per_second;
	return user_emission_rate_per_second;
}

function getEmissionRatePerSecond(emission_rate_per_hour: number) {
	return emission_rate_per_hour / 60 / 60;
}

function datetimeToUnix(time: IContractingTime) {
	let arr = time.__time__;
	return new Date(arr[0], arr[1] - 1, arr[2], arr[3], arr[4], arr[5]).getTime();
}
