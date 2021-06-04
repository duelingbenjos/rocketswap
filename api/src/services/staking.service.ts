import axios from "axios";
// import { SocketService } from "./socket.service";
import { log } from "../utils/logger";
import { Injectable, OnModuleInit } from "@nestjs/common";
import { staking_contracts } from "../config";
import { StakingMetaEntity } from "../entities/staking-meta.entity";
import { ParserProvider } from "../parser.provider";
import { PairEntity } from "../entities/pair.entity";
import { updateEpoch } from "../entities/staking-epoch.entity";
import { IKvp } from "../types/misc.types";
import { handleClientUpdateType } from "../types/websocket.types";
import { getVal } from "../utils/utils";
import { updateUserStakingInfo } from "../entities/user-staking.entity";
import { SocketService } from "./socket.service";
import { LpPointsEntity } from "../entities/lp-points.entity";

@Injectable()
export class StakingService implements OnModuleInit {
	constructor(private readonly socketService: SocketService) {}

	async onModuleInit() {
		setInterval(async () => {
			Promise.resolve(this.updateROI());
		}, 30000);
	}

	updateROI = async () => {
		// log.debug("UPDATE ROI CALLED")
		// log.log({staking_contracts})
		for (let contract_name of staking_contracts) {
			const meta_entity = await StakingMetaEntity.findOne(contract_name);
			// log.debug({meta_entity})
			if (meta_entity) {
				const ROI = await this.decideROI(meta_entity);
				// log.debug({ROI})
				if (ROI) meta_entity.ROI_yearly = ROI;
				this.socketService.handleClientUpdate({ action: "staking_panel_update", data: meta_entity });
				await meta_entity.save();
			}
		}
	};

	decideROI = async (meta_entity: StakingMetaEntity) => {
		const meta = meta_entity.meta;
		if (meta.type === "staking_simple") {
			/**
			 * Simple Staking Contract, TAU => RSWP
			 */
			// log.log("staking_simple called");
			return await this.getSimpleStakingROI(meta_entity.EmissionRatePerTauYearly);
		} else if (
			/**
			 * Smart Epoch Staking Contract, RSWP => RSWP
			 */
			meta.type === "staking_smart_epoch" &&
			meta.STAKING_TOKEN === ParserProvider.amm_meta_entity.TOKEN_CONTRACT &&
			meta.YIELD_TOKEN === ParserProvider.amm_meta_entity.TOKEN_CONTRACT
		) {
			// log.log("staking_smart_epoch called");
			return await this.getRSWPStakingROI(meta_entity);
		} else if (
			meta.type === "staking_smart_epoch_compounding_timeramp" &&
			meta.STAKING_TOKEN === ParserProvider.amm_meta_entity.TOKEN_CONTRACT &&
			meta.YIELD_TOKEN === ParserProvider.amm_meta_entity.TOKEN_CONTRACT
		) {
			return await this.getRSWPStakingROI(meta_entity);
		} else if (meta.type === "liquidity_mining_smart_epoch") {
			return await this.getLiqMiningROI(meta_entity);
		}
	};

	getLiqMiningROI = async (meta_entity: StakingMetaEntity) => {
		log.warn("getLiqMiningROI CALLED")
		// Get value of LP token
		const staking_token = meta_entity.meta.STAKING_TOKEN;
		const reward_token = meta_entity.meta.YIELD_TOKEN;

		const [staking_token_pair_entity, reward_token_pair_entity] = await Promise.all([
			PairEntity.findOne(staking_token),
			PairEntity.findOne(reward_token)
		]);
		if (!staking_token_pair_entity) {
			log.warn(`cannot calculate ROI for ${staking_token}, PairEntity not found.`);
			return 0;
		}
		const tau_lp_total = Number(staking_token_pair_entity.reserves[0]);
		const single_lp_value = (tau_lp_total / Number(staking_token_pair_entity.lp)) * 2;
		const total_staked_value = single_lp_value * meta_entity.StakedBalance
		
		const reward_value_per_year = Number(reward_token_pair_entity?.price) || 1 * this.getYearlyOutputFromHourly(meta_entity.EmissionRatePerHour)
		return Math.round(reward_value_per_year / total_staked_value * 100)
	};
	

	getRSWPStakingROI = async (meta_entity: StakingMetaEntity) =>
		Math.round((this.getYearlyOutputFromHourly(meta_entity.EmissionRatePerHour) / meta_entity.StakedBalance) * 100);

	getSimpleStakingROI = async (yearly_emission_rate: number) => {
		const rswp_entity = await PairEntity.findOne(ParserProvider.amm_meta_entity?.TOKEN_CONTRACT);
		if (rswp_entity && rswp_entity.price) {
			const apy = Math.round(parseFloat(rswp_entity.price) * yearly_emission_rate * 100);
			return apy;
		}
		// return false
	};

	updateMetaProperty = (metadata: any, key: string, value: string) => {
		if (!metadata) metadata = {};
		metadata[key] = value;
		return metadata;
	};

	getYearlyOutputFromHourly = (value: number) => value * 24 * 365;

	updateStakingContractMeta = async (args: {
		state: IKvp[];
		handleClientUpdate: handleClientUpdateType;
		staking_contract: string;
		timestamp: number;
		hash: string;
		fn: string;
	}) => {
		// console.log({ updateStakingContractMeta: args });
		try {
			const { state, handleClientUpdate, staking_contract, fn, hash, timestamp } = args;
			let previous_staked_balance: number;
			let entity = await StakingMetaEntity.findOne(staking_contract);
			if (!entity) {
				entity = new StakingMetaEntity();
				entity.contract_name = staking_contract;
			}
			for (let kvp of state) {
				switch (kvp.key) {
					case `${staking_contract}.Owner`:
						entity["Owner"] = getVal(kvp);
						break;
					case `${staking_contract}.DevRewardWallet`:
						entity["DevRewardWallet"] = getVal(kvp);
						break;
					case `${staking_contract}:CurrentEpochIndex`:
						entity["CurrentEpochIndex"] = getVal(kvp);
						break;
					case `${staking_contract}.StakedBalance`:
						if (entity.StakedBalance) previous_staked_balance = JSON.parse(JSON.stringify(entity.StakedBalance));
						entity["StakedBalance"] = getVal(kvp);
						break;
					case `${staking_contract}.meta:version`:
						entity["meta"] = this.updateMetaProperty(entity.meta, "version", getVal(kvp));
						break;
					case `${staking_contract}.meta:type`:
						entity["meta"] = this.updateMetaProperty(entity.meta, "type", getVal(kvp));
						break;
					case `${staking_contract}.meta:STAKING_TOKEN`:
						entity["meta"] = this.updateMetaProperty(entity.meta, "STAKING_TOKEN", getVal(kvp));
						break;
					case `${staking_contract}.meta:YIELD_TOKEN`:
						entity["meta"] = this.updateMetaProperty(entity.meta, "YIELD_TOKEN", getVal(kvp));
						break;
					case `${staking_contract}.EmissionRatePerHour`:
						entity["EmissionRatePerHour"] = getVal(kvp);
						break;
					case `${staking_contract}.DevRewardPct`:
						entity["DevRewardPct"] = getVal(kvp);
						break;
					case `${staking_contract}.StartTime`:
						entity["StartTime"] = getVal(kvp);
						break;
					case `${staking_contract}.EndTime`:
						entity["EndTime"] = getVal(kvp);
						break;
					case `${staking_contract}.OpenForBusiness`:
						entity["OpenForBusiness"] = getVal(kvp);
						break;
					case `${staking_contract}.__developer__`:
						entity["__developer__"] = getVal(kvp);
						break;
					case `${staking_contract}.EpochMaxRatioIncrease`:
						entity["EpochMaxRatioIncrease"] = getVal(kvp);
						break;
					case `${staking_contract}.EmissionRatePerTauYearly`:
						entity["EmissionRatePerTauYearly"] = getVal(kvp);
						entity["EmissionRatePerHour"] = parseFloat(getVal(kvp)) / 365 / 24;
						break;
					case `${staking_contract}.EmissionRatePerSecond`:
						entity["EmissionRatePerSecond"] = getVal(kvp);
						break;
					case `${staking_contract}.WithdrawnBalance`:
						entity["WithdrawnBalance"] = getVal(kvp);
						break;
					case `${staking_contract}.UseTimeRamp`:
						entity["UseTimeRamp"] = getVal(kvp);
						break;
					case `${staking_contract}.TimeRampValues`:
						entity["TimeRampValues"] = getVal(kvp);
						break;
				}

				if (kvp.key.includes("Epochs")) {
					const index = parseInt(kvp.key.split(":")[1]);
					const { staked, time, emission_rate_per_tau, amt_per_hr } = kvp.value;
					await updateEpoch({
						staking_contract,
						epoch_index: index,
						time,
						amount_staked: staked,
						emission_rate_per_tau,
						amt_per_hr,
						fn,
						real_staked_balance: entity.StakedBalance,
						previous_staked_balance,
						timestamp,
						hash,
						handleClientUpdate
					});
					entity.Epoch = {
						index,
						staked,
						time,
						amt_per_hr
					};
				}
			}
			await entity.save();

			const deposits = state.find((kvp) => kvp.key.includes("Deposits"));
			const withdrawals = state.find((kvp) => kvp.key.includes("Withdrawals"));
			if (deposits || withdrawals) {
				await updateUserStakingInfo({ deposits, withdrawals, staking_contract, fn, handleClientUpdate });
			}
			handleClientUpdate({ action: "staking_panel_update", data: entity });
		} catch (err) {
			console.error(err);
		}
	};
}
