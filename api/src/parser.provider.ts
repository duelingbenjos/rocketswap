import { Injectable, Logger } from "@nestjs/common";
import { BlockDTO, IKvp } from "./types/misc.types";
import { config, staking_contracts } from "./config";
import { getTokenList, prepareAddToken, saveToken, saveTokenUpdate } from "./entities/token.entity";
import { getContractCode, getContractName, validateTokenContract } from "./utils/utils";
import { saveTransfer, updateBalance } from "./entities/balance.entity";
import { savePair, savePairLp, saveReserves } from "./entities/pair.entity";
import { saveUserLp } from "./entities/lp-points.entity";
import { SocketService } from "./services/socket.service";
import { setName } from "./entities/name.entity";
import { AuthService } from "./authentication/trollbox.service";
import { AmmMetaEntity, updateAmmMeta } from "./entities/amm-meta.entity";
import { updateStakingContractMeta } from "./entities/staking-meta.entity";
import startBlockgrabber from "./blockgrabber";
import { log } from "./utils/logger";
import { savePrice } from "./entities/price.entity";

@Injectable()
export class ParserProvider {
	private static blockgrabber_last_update = Date.now()
	public static amm_meta_entity: AmmMetaEntity
	constructor(private readonly socketService: SocketService, private readonly authService: AuthService) {}
	private token_contract_list: string[];
	private action_que: { action: any; args: any }[] = [];
	private action_que_processing: boolean;
	private logger: Logger = new Logger("ParserProvider");

	public static updateLastChecked = (time_delta: number = 0) => {
		ParserProvider.blockgrabber_last_update = time_delta + Date.now()
	}

	async onModuleInit() {
		this.updateTokenList();
		ParserProvider.amm_meta_entity = await AmmMetaEntity.findOne();

		startBlockgrabber(this.handleNewBlock);

		setInterval(()=>{
			if (Date.now() - ParserProvider.blockgrabber_last_update > 120000 ) {
				log.warn("no response from blockgrabber in 120 seconds => starting it up again")
				ParserProvider.updateLastChecked()
				startBlockgrabber(this.handleNewBlock, true)
			}
		},5000)
	}

	public handleNewBlock = async (block: BlockDTO) => {
		// const { state, fn, contract, timestamp } = block;
		await this.parseBlock(
			block);
	};

	/** This method is passed to the blockgrabber as a callback and checks
	 * if we're interested in the contents of the block.
	 */

	public parseBlock = async (block: BlockDTO) => {
		// const { block } = update;
		const { state, fn, contract: contract_name, timestamp, hash } = block;
		// this.logger.log(contract_name)
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
				if (staking_contracts.includes(submitted_contract_name)) {
					this.addToActionQue(updateStakingContractMeta, {
						state,
						handleClientUpdate: this.socketService.handleClientUpdate,
						staking_contract: submitted_contract_name
					});
				}
				if (token_is_valid) {
					const add_token_dto = prepareAddToken(state);
					this.addToActionQue(saveToken, add_token_dto);
					this.addToActionQue(this.updateTokenList);
				}
				return;
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
			} else if (staking_contracts.includes(contract_name)) {
				this.addToActionQue(updateStakingContractMeta, {
					state,
					handleClientUpdate: this.socketService.handleClientUpdate,
					staking_contract: contract_name,
					fn
				});
			}
		} catch (err) {
			log.error(err)
		}
	};

	processAmmBlock = async (args: { fn: string; state: IKvp[]; timestamp: number; hash: string }) => {
		const { fn, state, timestamp, hash } = args;
		try {
			await savePair(state);
			await savePairLp(state);
			await saveUserLp({
				state,
				handleClientUpdate: this.socketService.handleClientUpdate
			});
			await saveReserves(fn, state, this.socketService.handleClientUpdate, timestamp, hash, ParserProvider.amm_meta_entity?.TOKEN_CONTRACT);
			await updateAmmMeta({
				state,
				handleClientUpdate: this.socketService.handleClientUpdate
			});
			await savePrice(state, this.socketService.handleClientUpdate)
		} catch (err) {
			log.error(err);
			
		}
	};

	/** The action que is added to attempt to solve a bug where transactions coming in from the blockgrabber fail to be processed
	 * by the parser. Assuming that it's a race condition causing it, this approach should be effective.
	 */

	private executeActionQue = async (action_que: { action: any; args: any }[]) => {
		try {
			if (action_que.length) {
				// this.logger.log(`ACTION QUE PROCESSING ${action_que.length} `)
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
			setTimeout(async () => this.executeActionQue(action_que), 1000);
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
