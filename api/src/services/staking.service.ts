import { log } from "../utils/logger";
import { forwardRef, Inject, Injectable, OnModuleInit } from "@nestjs/common";
import { StakingMetaEntity } from "../entities/staking-meta.entity";
import { DataSyncProvider } from "../data-sync.provider";
import { PairEntity } from "../entities/pair.entity";
import { updateEpoch } from "../entities/staking-epoch.entity";
import { IKvp } from "../types/misc.types";
import { handleClientUpdateType } from "../types/websocket.types";
import { getVal } from "../utils/utils";
import { updateUserStakingInfo } from "../entities/user-staking.entity";
import { SocketService } from "./socket.service";
import { changeVisibility } from "../utils/yield-utils";

@Injectable()
export class StakingService implements OnModuleInit {
	constructor(
		@Inject(forwardRef(() => SocketService))
		private readonly socketService: SocketService,
		@Inject(forwardRef(() => DataSyncProvider))
		private readonly parserProvider: DataSyncProvider
	) {}

	async onModuleInit() {
		Promise.resolve(this.updateROI());
		setInterval(async () => {
			Promise.resolve(this.updateROI());
		}, 30000);
	}

	updateROI = async () => {
		if (!ParserProvider.amm_meta_entity) return
		// log.debug("UPDATE ROI CALLED")
		// log.log({staking_contracts: this.parserProvider.getAllStakingContracts()})
		// log.log(this.parserProvider.getActiveStakingContracts().length)
		for (let contract_name of this.parserProvider.getActiveStakingContracts()) {
			const meta_entity = await StakingMetaEntity.findOne({ where: { contract_name, visible: true } });
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
			meta.STAKING_TOKEN === DataSyncProvider.amm_meta_entity.TOKEN_CONTRACT &&
			meta.YIELD_TOKEN === DataSyncProvider.amm_meta_entity.TOKEN_CONTRACT
		) {
			// log.log("staking_smart_epoch called");
			return await this.getRSWPStakingROI(meta_entity);
		} else if (
			meta.type === "staking_smart_epoch_compounding_timeramp" &&
			meta.STAKING_TOKEN === DataSyncProvider.amm_meta_entity.TOKEN_CONTRACT &&
			meta.YIELD_TOKEN === DataSyncProvider.amm_meta_entity.TOKEN_CONTRACT
		) {
			return await this.getRSWPStakingROI(meta_entity);
		} else if (
			meta.type === "staking_smart_epoch_compounding_timeramp" ||
			meta.type === "staking_smart_epoch" ||
			meta.type === "staking_smart_epoch_compounding"
		) {
			return await this.getSmartEpochCompoundingROI(meta_entity);
		} else if (meta.type === "liquidity_mining_smart_epoch") {
			return await this.getLiqMiningROI(meta_entity);
		}
	};

	getLiqMiningROI = async (meta_entity: StakingMetaEntity) => {
		// Get value of LP token
		const staking_token = meta_entity.STAKING_TOKEN;
		const reward_token = meta_entity.YIELD_TOKEN;

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
		const total_staked_value = single_lp_value * meta_entity.StakedBalance;
		let reward_token_price = reward_token_pair_entity ? reward_token_pair_entity?.price : 1;
		const reward_value_per_year = Number(reward_token_price) * this.getYearlyOutputFromHourly(meta_entity.EmissionRatePerHour);
		return Math.round((reward_value_per_year / total_staked_value) * 100);
	};

	getSmartEpochCompoundingROI = async (meta_entity: StakingMetaEntity) => {
		if (meta_entity.STAKING_TOKEN === meta_entity.YIELD_TOKEN) {
			return Math.round((this.getYearlyOutputFromHourly(meta_entity.EmissionRatePerHour) / meta_entity.StakedBalance) * 100);
		} else {
			const staking_token = meta_entity.STAKING_TOKEN;
			const reward_token = meta_entity.YIELD_TOKEN;
			const [staking_token_pair_entity, reward_token_pair_entity] = await Promise.all([
				PairEntity.findOne(staking_token),
				PairEntity.findOne(reward_token)
			]);
			if (!staking_token_pair_entity || !reward_token_pair_entity) return 0;
			const staking_p = Number(staking_token_pair_entity.price);
			const reward_p = Number(reward_token_pair_entity.price);

			const total_staked_value = staking_p * meta_entity.StakedBalance;
			const reward_value_per_year = reward_p * this.getYearlyOutputFromHourly(meta_entity.EmissionRatePerHour);
			return Math.round((reward_value_per_year / total_staked_value) * 100);
		}
	};

	getRSWPStakingROI = async (meta_entity: StakingMetaEntity) =>
		Math.round((this.getYearlyOutputFromHourly(meta_entity.EmissionRatePerHour) / meta_entity.StakedBalance) * 100);

	getSimpleStakingROI = async (yearly_emission_rate: number) => {
		const rswp_entity = await PairEntity.findOne(DataSyncProvider.amm_meta_entity?.TOKEN_CONTRACT);
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
		const { state, handleClientUpdate, fn, hash, timestamp, staking_contract } = args;
		let previous_staked_balance: number;
		let entity = await StakingMetaEntity.findOne(staking_contract);
		let new_staking_contract = false;
		if (!entity) {
			entity = new StakingMetaEntity();
			entity.contract_name = staking_contract;
			new_staking_contract = true;
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
					entity.STAKING_TOKEN = getVal(kvp);
					break;
				case `${staking_contract}.meta:YIELD_TOKEN`:
					entity["meta"] = this.updateMetaProperty(entity.meta, "YIELD_TOKEN", getVal(kvp));
					entity.YIELD_TOKEN = getVal(kvp);
					break;
				case `${staking_contract}.EmissionRatePerHour`:
					let value = getVal(kvp);
					entity["EmissionRatePerHour"] = getVal(kvp);
					if (changeVisibility(value) === "hide") entity.visible = false;
					else if (changeVisibility(value) === "show") entity.visible = true;
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
				default:
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
					real_staked_balance: entity.StakedBalance || 0,
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
		if (new_staking_contract === true) {
			this.parserProvider.addNewStakingToList(staking_contract);
			await this.parserProvider.updateStakingContractList();
		}

		const deposits = state.find((kvp) => kvp.key.includes("Deposits"));
		const withdrawals = state.find((kvp) => kvp.key.includes("Withdrawals"));
		if (deposits || withdrawals) {
			if (fn !== "stakeFromContractProfits") {
				await updateUserStakingInfo({ deposits, withdrawals, staking_contract, fn, handleClientUpdate });
			} else {
				const deposits_arr = state.filter((kvp) => kvp.key.includes("Deposits"));
				const withdrawals_arr = state.filter((kvp) => kvp.key.includes("Withdrawals"));
				// log.log({ deposits_arr });
				// log.log(withdrawals_arr);
				const exporter_contract = withdrawals_arr.find((kvp) => !kvp.key.includes(staking_contract)).key.split(".")[0];

				const importer_deposit = deposits_arr.find((kvp) => kvp.key.includes(staking_contract));
				const importer_withdrawal = withdrawals_arr.find((kvp) => kvp.key.includes(staking_contract));

				const exporter_deposit = deposits_arr.find((kvp) => kvp.key.includes(exporter_contract));
				const exporter_withdrawal = withdrawals_arr.find((kvp) => kvp.key.includes(exporter_contract));

				await updateUserStakingInfo({
					deposits: importer_deposit,
					withdrawals: importer_withdrawal,
					staking_contract,
					fn,
					handleClientUpdate
				});
				await updateUserStakingInfo({
					deposits: exporter_deposit,
					withdrawals: exporter_withdrawal,
					staking_contract: exporter_contract,
					fn,
					handleClientUpdate
				});
			}
		}
		handleClientUpdate({ action: "staking_panel_update", data: entity });
	};
}
