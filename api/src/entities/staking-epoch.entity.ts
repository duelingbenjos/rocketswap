import { IContractingTime } from "src/types/misc.types";
import { handleClientUpdateType } from "src/types/websocket.types";
import { log } from "../utils/logger";
import { Entity, Column, BaseEntity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class StakingEpochEntity extends BaseEntity {
	@PrimaryGeneratedColumn()
	id: string;

	@Column({ nullable: true })
	epoch_index: number;

	@Column({ type: "simple-json", nullable: true })
	time: IContractingTime;

	@Column({ nullable: true })
	amount_staked: number;

	@Column()
	staking_contract: string;

	@Column({ nullable: true })
	emission_rate_per_tau: string;

	@Column({ nullable: true })
	amt_per_hr: number;

	@Column({ nullable: true })
	fn: string;

	@Column({ nullable: true })
	previous_staked_balance: number;

	@Column({ nullable: true })
	real_staked_balance: number;

	@Column({ nullable: true })
	hash: string;

	@Column({ nullable: true })
	timestamp: number;
}

export async function updateEpoch(args: {
	staking_contract: string;
	epoch_index: number;
	amount_staked: any;
	amt_per_hr?: any;
	emission_rate_per_tau: any;
	time: any;
	fn: string;
	previous_staked_balance: number;
	real_staked_balance: number;
	timestamp: number;
	hash: string;
	handleClientUpdate: handleClientUpdateType;
}) {
	const {
		handleClientUpdate,
		amount_staked,
		time,
		epoch_index,
		staking_contract,
		amt_per_hr,
		emission_rate_per_tau,
		fn,
		real_staked_balance,
		previous_staked_balance,
		timestamp,
		hash
	} = args;
	const entity = new StakingEpochEntity();
	entity.amount_staked = amount_staked?.__fixed__;
	entity.emission_rate_per_tau = emission_rate_per_tau?.__fixed__;
	entity.time = time;
	entity.epoch_index = epoch_index;
	entity.staking_contract = staking_contract;
	entity.fn = fn;
	entity.previous_staked_balance = previous_staked_balance;
	entity.real_staked_balance = real_staked_balance;
	entity.timestamp = timestamp;
	entity.hash = hash;
	log.log({ amt_per_hr });
	if (amt_per_hr) {
		entity.amt_per_hr = amt_per_hr.__fixed__ ? amt_per_hr.__fixed__ : amt_per_hr;
	}

	await entity.save();
	handleClientUpdate({ action: "epoch_update", data: entity });
}
