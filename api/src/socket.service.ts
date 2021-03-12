import { Injectable, Logger } from "@nestjs/common";
import { Server } from "socket.io";
import { StakingEpochEntity } from "./entities/staking-epoch.entity";
import { StakingMetaEntity } from "./entities/staking-meta.entity";
import { getUserYield, getUserYieldPerSecond, UserStakingEntity } from "./entities/user-staking.entity";
import {
	handleAuthenticateResponseType,
	handleClientUpdateType,
	handleTrollboxMsg,
	handleProxyTxnResponse,
	EpochUpdateType,
	IUserYieldInfo,
	IUserYieldPayload
} from "./types/websocket.types";

@Injectable()
export class SocketService {
	private logger: Logger = new Logger("SocketService");

	public handleClientUpdate: handleClientUpdateType = null;
	public handleAuthenticateResponse: handleAuthenticateResponseType = null;
	public handleTrollboxMsg: handleTrollboxMsg = null;
	public handleProxyTxnResponse: handleProxyTxnResponse = null;
	public staking_epochs: { [key: string]: number };
	public staking_panel_clients: string[];

	async afterInit() {
		const staking_entities = await StakingMetaEntity.find();
		this.staking_epochs = staking_entities.reduce((accum, entity) => {
			accum[entity.contract_name] = entity.Epoch.index;
			return accum;
		}, {});
	}

	public updateEpochIndex(contract_name: string, index: number) {
		this.staking_epochs[contract_name] = index;
	}

	public async getClientYieldList(vk: string) {
		try {
			const staking_entities = await UserStakingEntity.find({ where: { vk } });
			const payload = staking_entities.reduce((accum, entity) => {
				accum[entity.staking_contract] = entity.yield_info;
				return accum;
			}, {});
			return payload;
		} catch (err) {}
	}

	public async sendClientStakingUpdates(update: EpochUpdateType) {
		try {
			const staking_contract = update.data.staking_contract;
			const epoch_entities = await StakingEpochEntity.find({ where: staking_contract });
			this.staking_panel_clients.forEach(async (vk) => {
				const user_entity = await UserStakingEntity.findOne(vk);
				if (user_entity) {
					const user_yield_payload: IUserYieldPayload = await this.updateClientStakingMetrics(
						vk,
						staking_contract,
						user_entity,
						epoch_entities
					);
					this.handleClientUpdate({
						action: "user_yield_update",
						data: user_yield_payload,
						vk
					});
				}
			});
		} catch (err) {
			this.logger.error(err);
		}
	}

	/**
	 * User Staking Updates
	 *
	 * 1.
	 * User Joins the staking panel
	 * user VK is added to staking_panel_clients
	 * all of users staking information is updated and returned to user.
	 *
	 * 2.
	 * User is connected to staking panel and staking information changes (epoch updates)
	 *
	 */

	// Change this to be {contract_name: { totalStaked, currentYield, yieldPerSec }}

	public async updateClientStakingMetrics(
		vk: string,
		staking_contract: string,
		user_entity: UserStakingEntity,
		epoch_entities: StakingEpochEntity[]
	): Promise<IUserYieldPayload> {
		try {
			/** TO DO :
			 * Make sure EPOCH ENTITIES ARE IN ORDER
			 */
			const meta_entity = await StakingMetaEntity.findOne({ where: staking_contract });

			const total_staked = user_entity.deposits.reduce((accum, deposit) => {
				return (accum += deposit.amount);
			}, 0);

			const current_yield = getUserYield({ meta: meta_entity, user: user_entity, epochs: epoch_entities });
			const yield_per_sec = getUserYieldPerSecond(meta_entity, total_staked);
			const time_updated = Date.now();
			const epoch_updated = meta_entity.Epoch.index;

			user_entity.yield_info = {
				current_yield,
				yield_per_sec,
				time_updated,
				epoch_updated,
				total_staked
			};

			user_entity.save();
			return {
				[staking_contract]: user_entity.yield_info
			};
		} catch (err) {
			this.logger.error(err);
		}
	}
}
