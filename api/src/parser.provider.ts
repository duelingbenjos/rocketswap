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
import { AmmMetaEntity, syncAmmCurrentState, updateAmmMeta } from "./entities/amm-meta.entity";
import blockgrabber from "./blockgrabber";
import { log } from "./utils/logger";
import { savePrice } from "./entities/price.entity";
import { StakingService } from "./services/staking.service";
import { nanoid } from "nanoid";
import { getStakingMetaList, StakingMetaEntity } from "./entities/staking-meta.entity";
import { syncTokenContracts } from "./utils/block-service-utils";

@Injectable()
export class ParserProvider {
	public static amm_meta_entity: AmmMetaEntity;

	constructor() {}

	async onModuleInit() {
		/**
		 * To Do on Application Start-up :
		 *
		 * Sync the following :
		 *
		 * 1.
		 *
		 * AMM META ENTITY
		 *
		 * Sync the current state of the AMM contract
		 *
		 */

		await syncAmmCurrentState();

		/**
		 *
		 * 2.
		 *
		 * TOKENS
		 *
		 * - Get a list of all submitted contracts & their source code.
		 * - Take all token contracts and create token objects for them
		 * - Find all updates for each token contract & process those changes
		 * - For Each token entity, find all trades, create trade objects for each
		 *
		 */

		await syncTokenContracts();

		/**
		 * 
		 * 3.
		 * 
		 * TRADES
		 * 
		 * 
		 */

		/**
		 *
		 * 4.
		 *
		 * FARM
		 *
		 * - Get all contracts submitted by the master contrct submittor & find the staking contracts,
		 * - .. create StakingMetaEntities for each one.
		 * - Get & Process all updates to the StakingMetaEntities
		 * - Create StakingEpochEntities for each StakingMetaEntity
		 * - Create UseStakingEntity for each active AMM contract
		 *
		 *
		 */

		/**
		 * 5.
		 * 
		 * SUBSCRIBE TO CONTRACT CHANGES
		 */
	}

	// public updateStakingContractList = async (): Promise<void> => {
	// 	const staking_list_update = await getStakingMetaList();
	// 	log.warn({ staking_list_update });
	// 	this.staking_contract_list_all = staking_list_update.all;
	// 	this.staking_contract_list_active = staking_list_update.active;
	// };

	// public addNewStakingToList = (contract_name: string) => {
	// 	this.staking_contract_list_all.push(contract_name);
	// 	log.warn({staking_contract_list_all: this.staking_contract_list_all})
	// 	this.staking_contract_list_all = this.staking_contract_list_all
	// };

	// public handleNewBlock = async (block: BlockDTO) => {
	// 	this.last_block = block.block_num
	// 	await this.parseBlock(block);
	// };

	// /** This method is passed to the blockgrabber as a callback and checks
	//  * if we're interested in the contents of the block.
	//  */

	// public parseBlock = async (block: BlockDTO) => {
	// 	const { state, fn, contract: contract_name, timestamp, hash, block_num } = block;
	// 	this.addToActionQue(updateLastBlock, {block_num})
	// 	this.addToActionQue(saveTransfer, {
	// 		state,
	// 		handleClientUpdate: this.socketService.handleClientUpdate
	// 	});
	// 	try {
	// 		if (contract_name === "submission" && fn === "submit_contract") {
	// 			// Check if the submitted contract is a token, if it's a token, add it to the DB
	// 			const contract_str = getContractCode(state);
	// 			const token_is_valid = validateTokenContract(contract_str);
	// 			const submitted_contract_name = getContractName(state);
	// 			if (submitted_contract_name === config.contractName) {
	// 				this.addToActionQue(updateAmmMeta, {
	// 					state,
	// 					handleClientUpdate: this.socketService.handleClientUpdate
	// 				});
	// 				this.addToActionQue(this.refreshAmmMeta);
	// 			}
	// 			if (token_is_valid) {
	// 				const add_token_dto = prepareAddToken(state);
	// 				this.addToActionQue(saveToken, add_token_dto);
	// 				this.addToActionQue(this.updateTokenList);
	// 			}
	// 			if (isValidStakingContract(state, submitted_contract_name)) {
	// 				this.addToActionQue(this.stakingService.updateStakingContractMeta, {
	// 					state,
	// 					handleClientUpdate: this.socketService.handleClientUpdate,
	// 					staking_contract: submitted_contract_name,
	// 					timestamp,
	// 					hash,
	// 					fn
	// 				});
	// 			}
	// 		} else if (contract_name === config.contractName) {
	// 			// handle events for the AMM contract
	// 			this.addToActionQue(this.processAmmBlock, {
	// 				state,
	// 				fn,
	// 				timestamp,
	// 				hash
	// 			});
	// 			return;
	// 		} else if (isUpdateFn(fn)) {
	// 			this.addToActionQue(saveTokenUpdate, state);
	// 		} else if (contract_name === config.identityContract) {
	// 			switch (fn) {
	// 				case "setName":
	// 					this.addToActionQue(setName, state);
	// 					break;
	// 				case "auth":
	// 					this.authService.authenticate(state);
	// 					break;
	// 			}
	// 		} else if (this.getAllStakingContracts().includes(contract_name)) {
	// 			this.addToActionQue(this.stakingService.updateStakingContractMeta, {
	// 				state,
	// 				handleClientUpdate: this.socketService.handleClientUpdate,
	// 				staking_contract: contract_name,
	// 				timestamp,
	// 				hash,
	// 				fn
	// 			});
	// 			this.addToActionQue(saveUserLp, {
	// 				state,
	// 				handleClientUpdate: this.socketService.handleClientUpdate
	// 			});
	// 		}
	// 	} catch (err) {
	// 		log.error(err);
	// 	}
	// };

	// processAmmBlock = async (args: { fn: string; state: IKvp[]; timestamp: number; hash: string }) => {
	// 	const { fn, state, timestamp, hash } = args;
	// 	try {
	// 		await savePair({
	// 			state,
	// 			handleClientUpdate: this.socketService.handleClientUpdate
	// 		});
	// 		await savePairLp(state);
	// 		await saveUserLp({
	// 			state,
	// 			handleClientUpdate: this.socketService.handleClientUpdate
	// 		});
	// 		await saveReserves(
	// 			fn,
	// 			state,
	// 			this.socketService.handleClientUpdate,
	// 			timestamp,
	// 			hash,
	// 			ParserProvider.amm_meta_entity?.TOKEN_CONTRACT
	// 		);
	// 		await updateAmmMeta({
	// 			state,
	// 			handleClientUpdate: this.socketService.handleClientUpdate
	// 		});
	// 		await savePrice(state, this.socketService.handleClientUpdate);
	// 	} catch (err) {
	// 		log.error(err);
	// 	}
	// };

	// public getAllStakingContracts = () => {
	// 	return this.staking_contract_list_all;
	// };

	// public getActiveStakingContracts = () => {
	// 	return this.staking_contract_list_active;
	// };

	// private updateTokenList = async (): Promise<void> => {
	// 	const token_list_update = await getTokenList();
	// 	this.token_contract_list = token_list_update;
	// };

	// private refreshAmmMeta = async () => {
	// 	const amm_meta_entity = await AmmMetaEntity.findOne();
	// 	ParserProvider.amm_meta_entity = amm_meta_entity;
	// };

	// private startBlockgrabber = async (skip_wipe: boolean = false, block_num?:number) => {
	// 	let id = nanoid(7);
	// 	ParserProvider.blockgrabber_active_instance_id = id;
	// 	blockgrabber(this.handleNewBlock, skip_wipe, id, block_num);
	// };
}

const isUpdateFn = (fn: string) => fn === "change_metadata";
