import { kStringMaxLength } from "buffer";
import { StakingEpochEntity } from "../entities/staking-epoch.entity";
import { StakingMetaEntity } from "../entities/staking-meta.entity";
import { IStakingDeposit, UserStakingEntity } from "../entities/user-staking.entity";
import { IContractingTime, ITimeRampValue } from "../types/misc.types";
import { log } from "./logger";
import { dateNowUtc } from "./utils";

export function calculateSmartEpochYield(args: {
	starting_epoch_index: number;
	amount: any;
	deposit_start_time: IContractingTime;
	current_epoch_index: number;
	epochs: StakingEpochEntity[];
	meta: StakingMetaEntity;
}): number {
	let { starting_epoch_index, amount, deposit_start_time, current_epoch_index, epochs, meta } = args;
	if (meta.contract_name === "con_rswp_compounding_01") log.log(epochs);

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
			delta = fitTime(dateNowUtc()) - fitTime(datetimeToUnix(deposit_start_time));
		} else if (this_epoch_index === starting_epoch_index) {
			delta = fitTime(datetimeToUnix(next_epoch.time)) - fitTime(datetimeToUnix(deposit_start_time));
		} else if (this_epoch_index === current_epoch_index) {
			delta = fitTime(dateNowUtc()) - fitTime(datetimeToUnix(this_epoch.time));
		} else {
			delta = fitTime(datetimeToUnix(next_epoch.time)) - fitTime(datetimeToUnix(this_epoch.time));
		}

		const delta_seconds = delta / 1000;
		let pct_share_of_stake = amount / this_epoch.amount_staked;
		let global_yield_this_epoch = delta_seconds * getEmissionRatePerSecond(this_epoch.amt_per_hr);
		let deposit_yield_this_epoch = global_yield_this_epoch * pct_share_of_stake;
		y += deposit_yield_this_epoch;
		this_epoch_index += 1;
	}
	return y;
}

export function calculateSimpleYield(args: {
	starting_epoch_index: number;
	amount: any;
	deposit_start_time: IContractingTime;
	current_epoch_index: number;
	epochs: StakingEpochEntity[];
	meta: StakingMetaEntity;
}): number {
	let { starting_epoch_index, amount, deposit_start_time, current_epoch_index, epochs, meta } = args;

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

export function calculateSmartCompoundingYield(args: {
	starting_epoch_index: number;
	amount: any; // {__fixed__: string}
	deposit_start_time: IContractingTime;
	current_epoch_index: number;
	epochs: StakingEpochEntity[];
	meta: StakingMetaEntity;
	step_offset?: [number, number];
}): number {
	let { starting_epoch_index, amount, deposit_start_time, current_epoch_index, epochs, meta, step_offset } = args;

	let start_time = datetimeToUnix(meta.StartTime);
	let end_time = datetimeToUnix(meta.EndTime);

	const fitTime = (time: number): number => {
		if (time < start_time) time = start_time;
		else if (time > end_time) time = end_time;
		return time;
	};

	let step_offset_ms = (step_offset ? step_offset[1] + daysToSeconds(step_offset[0]) : 0) * 1000;
	log.warn({ step_offset_ms });
	let deposit_start_step_adjusted = datetimeToUnix(deposit_start_time) + step_offset_ms;
	log.warn({ deposit_start_step_adjusted });
	log.warn({ deposit_start_time });
	log.warn({ dep_start_time: datetimeToUnix(deposit_start_time) });
	amount = parseFloat(amount.__fixed__);

	let this_epoch_index = starting_epoch_index;
	let y = 0;
	let step_multiplier = 1;

	while (this_epoch_index <= current_epoch_index) {
		let this_epoch = epochs[this_epoch_index];
		let next_epoch = epochs[this_epoch_index + 1];

		log.warn({ this_epoch_time: datetimeToUnix(this_epoch.time) });
		log.warn({ dateNowUtc: dateNowUtc() });
		log.warn({ 1: fitTime(dateNowUtc()) - fitTime(deposit_start_step_adjusted) });
		if (meta.UseTimeRamp) {
			let time_ramp_delta = fitTime(dateNowUtc()) - fitTime(datetimeToUnix(this_epoch.time)) + step_offset_ms;
			step_multiplier = findTimeRampStep(meta.TimeRampValues, time_ramp_delta);
		}

		let delta = 0;

		if (starting_epoch_index === current_epoch_index) {
			delta = fitTime(dateNowUtc()) - fitTime(deposit_start_step_adjusted);
			log.warn(1);
		} else if (this_epoch_index === starting_epoch_index) {
			delta = fitTime(datetimeToUnix(next_epoch.time)) - fitTime(deposit_start_step_adjusted);
			log.warn(2);
		} else if (this_epoch_index === current_epoch_index) {
			delta = fitTime(dateNowUtc()) - fitTime(datetimeToUnix(this_epoch.time));
			log.warn(3);
		} else {
			delta = fitTime(datetimeToUnix(next_epoch.time)) - fitTime(datetimeToUnix(this_epoch.time));
			log.warn(4);
		}

		const delta_seconds = delta / 1000;
		let pct_share_of_stake = amount / this_epoch.amount_staked;
		let global_yield_this_epoch = delta_seconds * getEmissionRatePerSecond(this_epoch.amt_per_hr);
		let deposit_yield_this_epoch = global_yield_this_epoch * pct_share_of_stake * step_multiplier;
		y += deposit_yield_this_epoch;
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
	}

	if (meta.meta.type === "staking_smart_epoch" || meta.meta.type === 'liquidity_mining_smart_epoch') {
		const emission_rate_per_hour = meta.EmissionRatePerHour;
		const total_emission_rate_per_second = getEmissionRatePerSecond(emission_rate_per_hour);
		const share_of_pool = total_staked / meta.StakedBalance;
		const user_emission_rate_per_second = share_of_pool * total_emission_rate_per_second;
		let dev_fee = user_emission_rate_per_second * meta.DevRewardPct;
		return stakingTimeWindowIsActive(meta) ? user_emission_rate_per_second - dev_fee : 0;
	}

	if (meta.meta.type === "staking_smart_epoch_compounding_timeramp") {
		let deposit = user_entity.deposits[0];
		let step_multiplier = 1;
		log.warn({ deposit });
		let step_offset =
			(deposit.step_offset ? deposit.step_offset.__delta__[1] + daysToSeconds(deposit.step_offset.__delta__[0]) : 0) * 1000;
		if (meta.UseTimeRamp) {
			let time_ramp_delta = fitTime(dateNowUtc(), meta) - fitTime(datetimeToUnix(deposit.time), meta) + step_offset;
			step_multiplier = findTimeRampStep(meta.TimeRampValues, time_ramp_delta);
		}

		const emission_rate_per_hour = meta.EmissionRatePerHour;
		const total_emission_rate_per_second = getEmissionRatePerSecond(emission_rate_per_hour);
		const share_of_pool = total_staked / meta.StakedBalance;
		const user_emission_rate_per_second = share_of_pool * total_emission_rate_per_second * step_multiplier;
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

function daysToMs(days: number): number {
	return days * 24 * 60 * 60 * 1000;
}

function daysToSeconds(days: number): number {
	return days * 24 * 60 * 60;
}

export function getUserRewardRate(meta: StakingMetaEntity, deposit: IStakingDeposit) {
	let time_ramp_values = meta.TimeRampValues;
	let step_offset = deposit.step_offset?.__delta__;
	let step_offset_ms = (step_offset ? step_offset[1] + daysToSeconds(step_offset[0]) : 0) * 1000;
	let time_ramp_delta = fitTime(dateNowUtc(), meta) - fitTime(datetimeToUnix(deposit.time), meta) + step_offset_ms;
	let step_multiplier = findTimeRampStep(meta.TimeRampValues, time_ramp_delta) * 100;
	return step_multiplier;
}

function findTimeRampStep(time_ramp_values: ITimeRampValue[], delta_ms: number): number {
	let time_step = time_ramp_values.find((step) => {
		daysToMs(step.lower) < delta_ms && daysToMs(step.upper) > delta_ms;
		let ms_lower = daysToMs(step.lower);
		let ms_upper = daysToMs(step.upper);
		return ms_lower < delta_ms && ms_upper > delta_ms;
	});
	if (!time_step) time_step = time_ramp_values[time_ramp_values.length - 1];
	return time_step.multiplier.__fixed__ ? parseFloat(time_step.multiplier.__fixed__) : time_step.multiplier;
}

const fitTime = (time: number, meta: StakingMetaEntity): number => {
	const { StartTime, EndTime } = meta;
	let start_time = datetimeToUnix(StartTime);
	let end_time = datetimeToUnix(EndTime);
	if (time < start_time) time = start_time;
	else if (time > end_time) time = end_time;
	return time;
};
