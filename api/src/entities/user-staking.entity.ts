import { IContractingTime, IKvp } from "../types/misc.types";
import { handleClientUpdateType, IUserYieldInfo } from "../types/websocket.types";
import { log } from "../utils/logger";
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
	if (deposits) {
		entity.deposits = deposits.value;
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
		let calcFn = meta.meta.type === "staking_simple" ? calculateSimpleYield : calculateYield;
		harvestable_yield += calcFn({
			starting_epoch_index: d.starting_epoch,
			amount: d.amount,
			deposit_start_time: d.time,
			current_epoch_index: meta.Epoch.index,
			epochs,
			meta
		});
	}

	harvestable_yield -= withdrawals;
	const dev_share = harvestable_yield * DevRewardPct;
	// log.log({dev_share, harvestable_yield, DevRewardPct})
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
	let { starting_epoch_index, amount, deposit_start_time, current_epoch_index, epochs, meta } = args;

	timeThing();

	let start_time = datetimeToUnix(meta.StartTime);
	let end_time = datetimeToUnix(meta.EndTime);

	const fitTime = (time: number): number => {
		if (time < start_time) time = start_time;
		else if (time > end_time) time = end_time;
		return time;
	};
	log.log(new Date(datetimeToUnix(deposit_start_time)).toLocaleTimeString());
	amount = parseFloat(amount.__fixed__);
	let this_epoch_index = starting_epoch_index;
	let y = 0;

	while (this_epoch_index <= current_epoch_index) {
		let this_epoch = epochs[this_epoch_index];
		let next_epoch = epochs[this_epoch_index + 1];
		log.log({ this_epoch_index });
		log.log({ this_epoch });
		log.log({ this_epoch_time: (dateNowUtc() - datetimeToUnix(deposit_start_time)) / 1000 });
		log.log({ now: new Date(dateNowUtc()).toLocaleTimeString() });
		log.log({ starting_epoch_index });
		let delta = 0;
		log.log({ utc_now: new Date().toUTCString() });
		if (starting_epoch_index === current_epoch_index) {
			delta = fitTime(dateNowUtc()) - fitTime(datetimeToUnix(deposit_start_time));
			log.log(1);
		} else if (this_epoch_index === starting_epoch_index) {
			log.log(2);
			log.log({ next_epoch });
			delta = fitTime(datetimeToUnix(next_epoch.time)) - fitTime(datetimeToUnix(deposit_start_time));
		} else if (this_epoch_index === current_epoch_index) {
			log.log(3);
			delta = fitTime(dateNowUtc()) - fitTime(datetimeToUnix(this_epoch.time));
		} else {
			log.log(4);
			delta = fitTime(datetimeToUnix(next_epoch.time)) - fitTime(datetimeToUnix(this_epoch.time));
		}

		const delta_seconds = delta / 1000;
		// log.log({delta_seconds})
		let pct_share_of_stake = amount / this_epoch.amount_staked;
		let global_yield_this_epoch = delta_seconds * getEmissionRatePerSecond(this_epoch.amt_per_hr);
		let deposit_yield_this_epoch = global_yield_this_epoch * pct_share_of_stake;
		log.log({ contract: meta.contract_name, global_yield_this_epoch, pct_share_of_stake });
		y += deposit_yield_this_epoch;
		this_epoch_index += 1;
	}
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
	let { starting_epoch_index, amount, deposit_start_time, current_epoch_index, epochs, meta } = args;
	// console.log(amount)
	// console.log(epochs)

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
		// console.log(this_epoch_index, current_epoch_index)
		let delta = 0;

		if (starting_epoch_index === current_epoch_index) {
			delta = fitTime(dateNowUtc()) - fitTime(datetimeToUnix(deposit_start_time));
		} else if (this_epoch_index === starting_epoch_index) {
			delta = fitTime(datetimeToUnix(next_epoch.time)) - fitTime(datetimeToUnix(deposit_start_time));
		} else if (this_epoch_index === current_epoch_index) {
			delta = fitTime(dateNowUtc()) - fitTime(datetimeToUnix(this_epoch.time));
		} else {
			delta = fitTime(datetimeToUnix(next_epoch.time)) - fitTime(datetimeToUnix(this_epoch.time));
		}
		const delta_seconds = delta / 1000;

		let rswp_per_tau_per_second = parseFloat(this_epoch.emission_rate_per_tau) / 365 / 24 / 60 / 60;

		y += rswp_per_tau_per_second * amount * delta_seconds;
		this_epoch_index += 1;
	}
	return y;
}

export function getUserYieldPerSecond(meta: StakingMetaEntity, total_staked: number, user_entity: UserStakingEntity) {
	if (meta.meta.type === "staking_simple") {
		const deposit_total = user_entity.deposits.reduce((accum, dep) => {
			return (accum += parseFloat(dep.amount.__fixed__));
		}, 0);
		const total = deposit_total * meta.EmissionRatePerSecond;
		let dev_fee = total * meta.DevRewardPct;
		return stakingTimeWindowIsActive(meta) ? total - dev_fee : 0;
	} else {
		const emission_rate_per_hour = meta.EmissionRatePerHour;
		const total_emission_rate_per_second = getEmissionRatePerSecond(emission_rate_per_hour);
		const share_of_pool = total_staked / meta.StakedBalance;
		const user_emission_rate_per_second = share_of_pool * total_emission_rate_per_second;
		let dev_fee = user_emission_rate_per_second * meta.DevRewardPct;
		return stakingTimeWindowIsActive(meta) ? user_emission_rate_per_second - dev_fee : 0;
	}
}

const stakingTimeWindowIsActive = (meta: StakingMetaEntity): boolean => {
	let { StartTime, EndTime } = meta;
	let start_time = datetimeToUnix(StartTime);
	let end_time = datetimeToUnix(EndTime);
	let time = dateNowUtc();

	return time > start_time && time < end_time;
};

function getEmissionRatePerSecond(emission_rate_per_hour: number) {
	return emission_rate_per_hour / 60 / 60;
}

function datetimeToUnix(time: IContractingTime) {
	let arr = time.__time__;
	return new Date(arr[0], arr[1] - 1, arr[2], arr[3], arr[4], arr[5]).getTime();
}

function dateNowUtc() {
	const utc_hour = new Date().getUTCHours();
	const this_zone_hour = new Date().getHours();

	const hour_difference = this_zone_hour - utc_hour;
	if (hour_difference !== 0) {
		let difference_ms = hour_difference * 60 * 60 * 1000;
		return Date.now() - difference_ms;
	}
	return Date.now();
}
