import { forwardRef, Inject, Injectable, Logger } from "@nestjs/common";
import { BlockDTO, IKvp } from "./types/misc.types";
import { config } from "./config";
import { getTokenList, prepareAddToken, saveToken, saveTokenUpdate } from "./entities/token.entity";
import { getContractCode, getContractName, isValidStakingContract, validateTokenContract } from "./utils/utils";
import { saveTransfer, updateBalance } from "./entities/balance.entity";
import { savePair, savePairLp, saveReserves } from "./entities/pair.entity";
import { saveUserLp } from "./entities/lp-points.entity";
import { SocketService } from "./services/socket.service";
import { setName } from "./entities/name.entity";
import { AuthService } from "./authentication/trollbox.service";
import { AmmMetaEntity, updateAmmMeta } from "./entities/amm-meta.entity";
import blockgrabber from "./blockgrabber";
import { log } from "./utils/logger";
import { savePrice } from "./entities/price.entity";
import { StakingService } from "./services/staking.service";
import { nanoid } from "nanoid";
import { getStakingMetaList, StakingMetaEntity } from "./entities/staking-meta.entity";

@Injectable()
export class ParserProvider {
	// Blockgrabber
	private static blockgrabber_last_update = Date.now();
	public static blockgrabber_active_instance_id: string;

	public static amm_meta_entity: AmmMetaEntity;

	constructor(
		private readonly authService: AuthService,
		@Inject(forwardRef(() => StakingService))
		private readonly stakingService: StakingService,
		@Inject(forwardRef(() => SocketService))
		private readonly socketService: SocketService
	) {}

	private staking_contract_list_all: string[] = [];
	private staking_contract_list_active: string[] = [];
	private token_contract_list: string[];
	private action_que: { action: any; args: any }[] = [];
	private action_que_processing: boolean;
	private last_block: number

	public static updateLastChecked = (time_delta: number = 0) => {
		ParserProvider.blockgrabber_last_update = time_delta + Date.now();
	};

	async onModuleInit() {
		this.updateTokenList();
		// await this.updateStakingContractList();
		await this.updateStakingContractList();
		ParserProvider.amm_meta_entity = await AmmMetaEntity.findOne();

		this.startBlockgrabber(false);

		/**
		 * Temporary workaround, since the blockgrabber likes to stop checking for blocks randomly.
		 */
		setInterval(() => {
			if (Date.now() - ParserProvider.blockgrabber_last_update > 120000) {
				log.warn("no response from blockgrabber in 30 seconds => starting it up again");
				ParserProvider.updateLastChecked();
				this.startBlockgrabber(false, this.last_block);
			}
		}, 5000);
		// setInterval(() => {
		// 	this.addToActionQue(this.updateStakingContractList);
		// }, 10000);
	}

	public updateStakingContractList = async (): Promise<void> => {
		const staking_list_update = await getStakingMetaList();
		log.warn({ staking_list_update });
		this.staking_contract_list_all = staking_list_update.all;
		this.staking_contract_list_active = staking_list_update.active;
	};

	public addNewStakingToList = (contract_name: string) => {
		this.staking_contract_list_all.push(contract_name);
		log.warn({staking_contract_list_all: this.staking_contract_list_all})
		this.staking_contract_list_all = this.staking_contract_list_all
	};

	public handleNewBlock = async (block: BlockDTO) => {
		this.last_block = block.block_num
		await this.parseBlock(block);
	};

	/** This method is passed to the blockgrabber as a callback and checks
	 * if we're interested in the contents of the block.
	 */

	public parseBlock = async (block: BlockDTO) => {
		const { state, fn, contract: contract_name, timestamp, hash } = block;
		this.addToActionQue(saveTransfer, {
			state,
			handleClientUpdate: this.socketService.handleClientUpdate
		});
		try {
			if (contract_name === "submission" && fn === "submit_contract") {
				// Check if the submitted contract is a token, if it's a token, add it to the DB
				const contract_str = getContractCode(state);
				const token_is_valid = validateTokenContract(contract_str);
				const submitted_contract_name = getContractName(state);
				if (submitted_contract_name === config.contractName) {
					this.addToActionQue(updateAmmMeta, {
						state,
						handleClientUpdate: this.socketService.handleClientUpdate
					});
					this.addToActionQue(this.refreshAmmMeta);
				}
				if (token_is_valid) {
					const add_token_dto = prepareAddToken(state);
					this.addToActionQue(saveToken, add_token_dto);
					this.addToActionQue(this.updateTokenList);
				}
				if (isValidStakingContract(state, submitted_contract_name)) {
					this.addToActionQue(this.stakingService.updateStakingContractMeta, {
						state,
						handleClientUpdate: this.socketService.handleClientUpdate,
						staking_contract: submitted_contract_name,
						timestamp,
						hash,
						fn
					});
				}
			} else if (contract_name === config.contractName) {
				// handle events for the AMM contract
				this.addToActionQue(this.processAmmBlock, {
					state,
					fn,
					timestamp,
					hash
				});
				return;
			} else if (isUpdateFn(fn)) {
				this.addToActionQue(saveTokenUpdate, state);
			} else if (contract_name === config.identityContract) {
				switch (fn) {
					case "setName":
						this.addToActionQue(setName, state);
						break;
					case "auth":
						this.authService.authenticate(state);
						break;
				}
			} else if (this.getAllStakingContracts().includes(contract_name)) {
				this.addToActionQue(this.stakingService.updateStakingContractMeta, {
					state,
					handleClientUpdate: this.socketService.handleClientUpdate,
					staking_contract: contract_name,
					timestamp,
					hash,
					fn
				});
				this.addToActionQue(saveUserLp, {
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

	/** The action que attempts to solve a bug where transactions coming in from the blockgrabber fail to be processed
	 * by the parser. Assuming that it's a race condition causing it, this approach should be effective.
	 */

	private executeActionQue = async (action_que: { action: any; args: any }[]) => {
		try {
			if (action_que.length) {
				const { action, args } = this.action_que[0];
				if (args) {
					await action(args);
				} else {
					await action();
				}
				this.action_que.splice(0, 1);
				this.executeActionQue(action_que);
			} else {
				this.action_que_processing = false;
			}
		} catch (err) {
			log.error(err);
			this.action_que.splice(0, 1);
			setTimeout(() => this.executeActionQue(action_que), 1000);
		}
	};

	private addToActionQue = (action: any, args?) => {
		this.action_que.push({ action, args });
		// this.logger.log(`ADDING ITEM TO ACTION QUE : ${this.action_que.length} ACTIONS OUTSTANDING`)
		if (!this.action_que_processing) {
			this.action_que_processing = true;
			this.executeActionQue(this.action_que);
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

	private startBlockgrabber = (skip_wipe: boolean = false, block_num?:number) => {
		let id = nanoid(7);
		ParserProvider.blockgrabber_active_instance_id = id;
		blockgrabber(this.handleNewBlock, skip_wipe, id, block_num);
	};
}

const isUpdateFn = (fn: string) => fn === "change_metadata";
