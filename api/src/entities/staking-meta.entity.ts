import { IContractingTime, IKvp } from "src/types/misc.types";
import { getVal } from "../utils";
import { Entity, Column, BaseEntity, PrimaryColumn } from "typeorm";
import { handleClientUpdateType } from "../types/websocket.types";
import { updateUserStakingInfo } from "./user-staking.entity";
import { updateEpoch } from "./staking-epoch.entity";

@Entity()
export class StakingMetaEntity extends BaseEntity {
	@PrimaryColumn()
	contract_name: string;

	@Column({ nullable: true })
	DevRewardWallet: string;

	@Column({ nullable: true })
	StakedBalance: number;

	@Column({ nullable: true, type: "simple-json" })
	meta: {type: string, version: string, YIELD_TOKEN: string, STAKING_TOKEN: string}; // Version Number of the staking contract

	@Column({ nullable: true })
	EmissionRatePerHour: number;

	@Column({ nullable: true })
	EmissionRatePerTauYearly: number;

	@Column({ nullable: true })
	EmissionRatePerSecond: number;

	@Column({ nullable: true })
	DevRewardPct: number;

	@Column({ nullable: true, type: "simple-json" })
	StartTime: IContractingTime;

	@Column({ nullable: true, type: "simple-json" })
	EndTime: IContractingTime;

	@Column({ nullable: true })
	OpenForBusiness: boolean;

	@Column({ nullable: true })
	__developer__: string;

	@Column({ nullable: true, type: "simple-json" })
	Epoch: {
		index: number;
		staked: number;
		time: IContractingTime;
	};
}

export const updateStakingContractMeta = async (args: {
	state: IKvp[];
	handleClientUpdate: handleClientUpdateType;
	staking_contract: string;
	fn: string;
}) => {
	// console.log({ updateStakingContractMeta: args });
	try {
		const { state, handleClientUpdate, staking_contract, fn } = args;
		console.log(state)
		let entity = await StakingMetaEntity.findOne(staking_contract);
		console.log({ STAKING_CONTRACT: staking_contract });
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
					entity["StakedBalance"] = getVal(kvp);
					break;
				case `${staking_contract}.meta:version`:
					entity["meta"] = updateMetaProperty(entity.meta, "version", getVal(kvp));
					break;
				case `${staking_contract}.meta:type`:
					entity["meta"] = updateMetaProperty(entity.meta, "type", getVal(kvp));
					break;
				case `${staking_contract}.meta:STAKING_TOKEN`:
					entity["meta"] = updateMetaProperty(entity.meta, "STAKING_TOKEN", getVal(kvp));
					break;
				case `${staking_contract}.meta:YIELD_TOKEN`:
					entity["meta"] = updateMetaProperty(entity.meta, "YIELD_TOKEN", getVal(kvp));
					break;
				case `${staking_contract}.meta:STAKING_TOKEN`:
					entity["meta_STAKING_TOKEN"] = getVal(kvp);
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
				case `${staking_contract}.EmissionRatePerTauYearly`:
					entity["EmissionRatePerTauYearly"] = getVal(kvp);
					break;
				case `${staking_contract}.EmissionRatePerSecond`:
					entity["EmissionRatePerSecond"] = getVal(kvp);
					break;
			}
			if (kvp.key.includes("Epochs")) {
				const index = parseInt(kvp.key.split(":")[1]);
				const { staked, time, emission_rate_per_tau } = kvp.value;
				await updateEpoch({
					staking_contract,
					epoch_index: index,
					time,
					amount_staked: staked,
					emission_rate_per_tau,
					handleClientUpdate
				});
				entity.Epoch = {
					index,
					staked,
					time
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

const updateMetaProperty = (metadata: any, key: string, value: string) => {
	if (!metadata) metadata = {};
	metadata[key] = value;
	return metadata;
};
