import { Injectable, Logger } from "@nestjs/common";
import { fillMissingEpochs, filterEpochs, getUserRewardRate, getUserYieldPerSecond } from "../utils/yield-utils";
import { StakingEpochEntity } from "../entities/staking-epoch.entity";
import { StakingMetaEntity } from "../entities/staking-meta.entity";
import { getUserYield, UserStakingEntity } from "../entities/user-staking.entity";
import {
	handleAuthenticateResponseType,
	handleClientUpdateType,
	handleTrollboxMsg,
	handleProxyTxnResponse,
	IUserYieldPayload
} from "../types/websocket.types";
import { log } from "../utils/logger";
import { ParserProvider } from "../parser.provider";
@Injectable()
export class SocketService {
	constructor(private readonly parserProvider: ParserProvider) {}
	private logger: Logger = new Logger("SocketService");

	public handleClientUpdate: handleClientUpdateType = null;
	public handleAuthenticateResponse: handleAuthenticateResponseType = null;
	public handleTrollboxMsg: handleTrollboxMsg = null;
	public handleProxyTxnResponse: handleProxyTxnResponse = null;
	public staking_epochs: { [key: string]: number } = {};
	public staking_panel_clients: string[] = [];

	async afterInit() {
		const staking_entities = await StakingMetaEntity.find({ where: { OpenForBusiness: true } });
		this.staking_epochs = staking_entities.reduce((accum, entity) => {
			accum[entity.contract_name] = entity.Epoch.index;
			return accum;
		}, {});
	}

	public addStakingPanelClient(vk: string) {
		//console.log("addStakingPanelClient called");
		const idx = this.staking_panel_clients.indexOf(vk);
		if (idx < 0) {
			this.staking_panel_clients.push(vk);
		}
	}

	public removeStakingPanelClient(vk: string) {
		const idx = this.staking_panel_clients.indexOf(vk);
		if (idx > -1) {
			this.staking_panel_clients.splice(idx, 1);
		}
	}

	public updateEpochIndex(contract_name: string, index: number) {
		this.staking_epochs[contract_name] = index;
	}

	public async getClientYieldList(vk: string) {
		try {
			const staking_entities = await UserStakingEntity.find({ where: { vk } });
			const payload = await staking_entities
				.filter((ent) => this.parserProvider.getActiveStakingContracts().includes(ent.staking_contract))
				.reduce(async (accumP, user_entity) => {
					const accum = await accumP;
					if (
						(!user_entity.yield_info ||
							!Object.keys(user_entity.yield_info).length ||
							user_entity.yield_info.epoch_updated !== this.staking_epochs[user_entity.staking_contract]) &&
						user_entity.deposits.length
					) {
						const epoch_entities = await StakingEpochEntity.find({
							where: { staking_contract: user_entity.staking_contract },
							take: 10000
						});
						const staking_meta_entity = await StakingMetaEntity.findOneOrFail(user_entity.staking_contract);
						/** Hack here to make this work, on testnet, after multiple resyncs. */
						const epoch_entities_filtered = filterEpochs(epoch_entities);
						/** Hack here because  */
						const epoch_entities_complete = await fillMissingEpochs(
							user_entity.staking_contract,
							epoch_entities_filtered,
							staking_meta_entity.Epoch.index
						);
						epoch_entities_complete.sort((a, b) => a.epoch_index - b.epoch_index);
				
						const metrics = await this.updateClientStakingMetrics(
							vk,
							user_entity.staking_contract,
							user_entity,
							epoch_entities
						);
						user_entity.yield_info = metrics[user_entity.staking_contract];
						user_entity.save();
					}
					accum[user_entity.staking_contract] = user_entity.yield_info;
					return accum;
				}, Promise.resolve({}));
			return payload;
		} catch (err) {
			log.error(err);
		}
	}

	public async sendClientStakingUpdates(staking_contract: string) {
		try {
			const epoch_entities = await StakingEpochEntity.find({ where: { staking_contract }, take: 10000 });
			for (let vk of this.staking_panel_clients) {
				const user_entity = await UserStakingEntity.findOne({ where: { vk, staking_contract } });
				if (user_entity) {
					const user_yield_payload: IUserYieldPayload = await this.updateClientStakingMetrics(
						vk,
						staking_contract,
						user_entity,
						epoch_entities
					);
					user_entity.yield_info = user_yield_payload[staking_contract];
					await user_entity.save();
					this.handleClientUpdate({
						action: "user_yield_update",
						data: user_yield_payload,
						vk
					});
				}
			}
		} catch (err) {
			log.error(err);
		}
	}

	public async updateClientStakingMetrics(
		vk: string,
		staking_contract: string,
		user_entity: UserStakingEntity,
		epoch_entities: StakingEpochEntity[]
	): Promise<IUserYieldPayload> {
		try {
			const meta_entity = await StakingMetaEntity.findOne({ where: { contract_name: staking_contract, OpenForBusiness: true } });
			if (!meta_entity) return;
			const total_staked = user_entity.deposits.reduce((accum, deposit) => {
				return (accum += parseFloat(deposit.amount.__fixed__));
			}, 0);
			const current_yield = getUserYield({ meta: meta_entity, user: user_entity, epochs: epoch_entities });
			const yield_per_sec = user_entity.deposits.length ? getUserYieldPerSecond(meta_entity, total_staked, user_entity) : 0;
			const time_updated = Date.now();
			const epoch_updated = meta_entity.Epoch.index;

			user_entity.yield_info = {
				current_yield,
				yield_per_sec,
				time_updated,
				epoch_updated,
				total_staked
			};

			if (meta_entity.meta.type === "staking_smart_epoch_compounding_timeramp" && user_entity.deposits[0])
				// log.log(user_entity)
				user_entity.yield_info.user_reward_rate = getUserRewardRate(meta_entity, user_entity.deposits[0]);

			await user_entity.save();
			return {
				[staking_contract]: user_entity.yield_info
			};
		} catch (err) {
			log.error(err);
		}
	}
}
