import { IKvp } from "src/types/misc.types";
import { config } from "../config";
import { Entity, Column, BaseEntity, PrimaryColumn } from "typeorm";

@Entity()
export class UserStakingEntity extends BaseEntity {
	@PrimaryColumn()
	vk: string;

	@Column({ nullable: true, type: "simple-json" })
	deposits: {
		[key: string]: {
			amount: string;
			starting_epoch: number;
			time: any[];
		};
	};

	@Column({ nullable: true, type: "simple-json" })
	withdrawals: {
		[key: string]: number | false;
	};
}

export async function updateUserStakingInfo(args: { deposits: IKvp | undefined; withdrawals: IKvp | undefined; staking_contract: string }) {
	const { deposits, withdrawals, staking_contract } = args;
	const vk = deposits ? deposits.key.split(":")[1] : withdrawals.key.split(":")[1];
	let entity = await UserStakingEntity.findOne(vk);
	if (!entity) {
		entity = new UserStakingEntity();
		entity.deposits = {};
		entity.withdrawals = {};
		entity.vk = vk;
	}
	if (deposits) {
		entity.deposits[staking_contract] = deposits.value;
	}
	if (withdrawals) {
		entity.withdrawals[staking_contract] = withdrawals.value;
	}
	return await entity.save();
}