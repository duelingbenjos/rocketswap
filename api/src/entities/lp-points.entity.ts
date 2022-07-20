import { IKvp } from "src/types/misc.types";
import { getVal } from "../utils/utils";
import {
	Entity,
	Column,
	PrimaryColumn,
	BaseEntity,
	PrimaryGeneratedColumn
} from "typeorm";
import { handleClientUpdateType } from "../types/websocket.types";
import { config } from "../config";

/** This entity is created / updated when the LP points balance of an address changes or an LP pair is created. */

@Entity()
export class LpPointsEntity extends BaseEntity {
	@PrimaryColumn()
	vk: string;

	@Column({ type: "simple-json" })
	points: { [key: string]: string };

	@Column()
	time: string = Date.now().toString();
}

export async function saveUserLp(args: {
	state: IKvp[];
	handleClientUpdate: handleClientUpdateType;
}) {
	const { state, handleClientUpdate } = args;
	const lp_kvp = state.filter(
		(kvp) => {
			const parts = kvp.key.split(":")
			return parts[0] === `${config.amm_contract}.lp_points`
		}
	);

	if (!lp_kvp.length) return

	for (let kvp of lp_kvp) {
		const parts = kvp.key.split(":");
		const contract_name = parts[1];
		/** Change in user LP points amount */
		if (parts.length === 3) {
			let entity = await LpPointsEntity.findOne(parts[2]);
			if (!entity) {
				entity = new LpPointsEntity();
				entity.vk = parts[2];
				entity.points = {};
			}
			const value = getVal(kvp);
			entity.points[contract_name] = value
			await entity.save();
			handleClientUpdate({
				action: "user_lp_update",
				points: entity.points,
				vk: entity.vk
			});
		}
		/** Pair is created */
		else if (parts.length === 2) {
			let entity = await LpPointsEntity.findOne(parts[0].split(".")[0]);
			if (!entity) {
				entity = new LpPointsEntity();
				entity.vk = parts[0].split(".")[0];
				entity.points = {};
			}
			const value = getVal(kvp);
			entity.points[contract_name] = value
			await entity.save();
			handleClientUpdate({
				action: "user_lp_update",
				points: entity.points,
				vk: entity.vk
			});
		}
	}
}
