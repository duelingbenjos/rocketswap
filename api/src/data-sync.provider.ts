import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { IKvp } from "./types/misc.types";
import { config } from "./config";
import { getTokenList, prepareAddToken, saveToken, saveTokenUpdate } from "./entities/token.entity";
import { getContractCode, getContractName, isValidStakingContract, validateTokenContract } from "./utils/utils";
import { saveTransfer } from "./entities/balance.entity";
import { savePair, savePairLp, saveReserves, updatePairs } from "./entities/pair.entity";
import { saveUserLp } from "./entities/lp-points.entity";
import { SocketService } from "./services/socket.service";
import { setName } from "./entities/name.entity";
import { AuthService } from "./authentication/trollbox.service";
import { AmmMetaEntity, syncAmmCurrentState, updateAmmMeta } from "./entities/amm-meta.entity";
import { log } from "./utils/logger";
import { savePrice } from "./entities/price.entity";
import { StakingService } from "./services/staking.service";
import { getStakingMetaList } from "./entities/staking-meta.entity";
import { fillBlocksSinceSync, getLatestSyncedBlock, syncContracts, syncIdentityData, syncTradeHistory } from "./utils/block-service-utils";
import { BlockDTO, initSocket } from "./socket-client.provider";
import { getLastProcessedBlock, startTrimLastBlocksTask } from "./entities/last-block.entity";

@Injectable()
export class ParserProvider {
	constructor(
		private readonly authService: AuthService,
		@Inject(forwardRef(() => StakingService))
		private readonly stakingService: StakingService,
		@Inject(forwardRef(() => SocketService))
		private readonly socketService: SocketService
	) {}

	public static amm_meta_entity: AmmMetaEntity;

	staking_contract_list_all: any[] = [];
	staking_contract_list_active: any[] = [];
	token_contract_list: any[] = [];

	async onModuleInit() {
		const last_block_saved_db = await getLastProcessedBlock();
		const latest_synced_block_bs = await getLatestSyncedBlock();
		const start_sync_block = last_block_saved_db || latest_synced_block_bs;

		if (!last_block_saved_db) {
			await syncAmmCurrentState();
			await this.refreshAmmMeta();
			await syncContracts();
			await updatePairs();
			await syncIdentityData();
			await syncTradeHistory();
		} else {
			log.log(`last block detected in local db.`);
			log.log(`starting block sync from block ${start_sync_block}`);
		}

		await this.refreshAmmMeta();

		await fillBlocksSinceSync(start_sync_block, this.parseBlock);

		initSocket(this.parseBlock);

		await this.updateStakingContractList();
		startTrimLastBlocksTask();
	}

	public updateStakingContractList = async (): Promise<void> => {
		const staking_list_update = await getStakingMetaList();
		this.staking_contract_list_all = staking_list_update.all;
		this.staking_contract_list_active = staking_list_update.active;
	};

	public addNewStakingToList = (contract_name: string) => {
		this.staking_contract_list_all.push(contract_name);
		log.warn({ staking_contract_list_all: this.staking_contract_list_all });
		this.staking_contract_list_all = this.staking_contract_list_all;
	};

	/**
	 * ALL NEW BLOCKS ARE PASSED THROUGH THIS FUNCTION FOR PROCESSING
	 */

	public parseBlock = async (block: BlockDTO) => {
		const { state, fn, contract: contract_name, timestamp, hash } = block;
		saveTransfer({
			state,
			handleClientUpdate: this.socketService.handleClientUpdate
		});
		try {
			if (contract_name === "submission" && fn === "submit_contract") {
				// Check if the submitted contract is a token, if it's a token, add it to the DB
				const contract_str = getContractCode(state);
				const token_is_valid = validateTokenContract(contract_str);
				const submitted_contract_name = getContractName(state);
				if (submitted_contract_name === config.amm_contract) {
					updateAmmMeta({
						state,
						handleClientUpdate: this.socketService.handleClientUpdate
					});
					this.refreshAmmMeta();
				}
				if (token_is_valid) {
					const add_token_dto = prepareAddToken(state);
					saveToken(add_token_dto);
					this.updateTokenList();
				}
				if (isValidStakingContract(state, submitted_contract_name)) {
					this.stakingService.updateStakingContractMeta({
						state,
						handleClientUpdate: this.socketService.handleClientUpdate,
						staking_contract: submitted_contract_name,
						timestamp,
						hash,
						fn
					});
				}
			} else if (contract_name === config.amm_contract) {
				this.processAmmBlock({
					state,
					fn,
					timestamp,
					hash
				});
				return;
			} else if (isUpdateFn(fn)) {
				saveTokenUpdate(state);
			} else if (contract_name === config.identity_contract) {
				switch (fn) {
					case "setName":
						setName(state);
						break;
					case "auth":
						this.authService.authenticate(state);
						break;
				}
			} else if (this.getAllStakingContracts().includes(contract_name)) {
				this.stakingService.updateStakingContractMeta({
					state,
					handleClientUpdate: this.socketService.handleClientUpdate,
					staking_contract: contract_name,
					timestamp,
					hash,
					fn
				});
				saveUserLp({
					state,
					handleClientUpdate: this.socketService.handleClientUpdate
				});
			}
		} catch (err) {
			log.error(err);
		}
	};

	processAmmBlock = async (args: { fn: string; state: IKvp[]; timestamp: number; hash: string }) => {
		const { fn, state, timestamp, hash } = args;
		try {
			await savePair({
				state,
				handleClientUpdate: this.socketService.handleClientUpdate
			});
			await savePairLp(state);
			await saveUserLp({
				state,
				handleClientUpdate: this.socketService.handleClientUpdate
			});
			await saveReserves(
				fn,
				state,
				this.socketService.handleClientUpdate,
				timestamp,
				hash,
				ParserProvider.amm_meta_entity?.TOKEN_CONTRACT
			);
			await updateAmmMeta({
				state,
				handleClientUpdate: this.socketService.handleClientUpdate
			});
			await savePrice(state, this.socketService.handleClientUpdate);
		} catch (err) {
			log.error(err);
		}
	};

	public getAllStakingContracts = () => {
		return this.staking_contract_list_all;
	};

	public getActiveStakingContracts = () => {
		return this.staking_contract_list_active;
	};

	private updateTokenList = async (): Promise<void> => {
		const token_list_update = await getTokenList();
		this.token_contract_list = token_list_update;
	};

	private refreshAmmMeta = async () => {
		const amm_meta_entity = await AmmMetaEntity.findOne();
		ParserProvider.amm_meta_entity = amm_meta_entity;
	};
}

const isUpdateFn = (fn: string) => fn === "change_metadata";
