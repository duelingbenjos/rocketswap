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

/** This entity is created / updated when the LP points balance of an address changes. */

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
	// [{key:"con_amm2.lp_points:con_token_test7:f8a429afc20727902fa9503f5ecccc9b40cfcef5bcba05204c19e44423e65def",value: 100}]
	// { key: "con_amm2.lp_points:con_token_test7", value: 100 }
	const lp_kvp = state.filter(
		(kvp) => kvp.key.split(".")[1].split(":")[0] === "lp_points"
	);
	for (let kvp of lp_kvp) {
		const parts = kvp.key.split(":");
		const contract_name = parts[1];
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
		} else if (parts.length === 2) {
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
