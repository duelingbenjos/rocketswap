import { Injectable, Logger } from "@nestjs/common"
import { IKvp } from "./types/misc.types"
import { config, staking_contracts } from "./config"
import { getTokenList, prepareAddToken, saveToken, saveTokenUpdate } from "./entities/token.entity"
import { getContractCode, getContractName, validateTokenContract } from "./utils"
import { saveTransfer, updateBalance } from "./entities/balance.entity"
import { savePair, savePairLp, saveReserves } from "./entities/pair.entity"
import { saveUserLp } from "./entities/lp-points.entity"
import { savePrice } from "./entities/price.entity"
import { IBlockParser } from "./types/websocket.types"
import { SocketService } from "./socket.service"
import { setName } from "./entities/name.entity"
import { AuthService } from "./authentication/trollbox.service"
import { updateAmmMeta } from "./entities/amm-meta.entity"
import { updateStakingContractMeta } from "./entities/staking-meta.entity"

@Injectable()
export class ParserProvider {
	constructor(private readonly socketService: SocketService, private readonly authService: AuthService) {}
	private token_contract_list: string[]
	private action_que: { action: any; args: any }[] = []
	private action_que_processing: boolean
	private logger: Logger = new Logger("ParserProvider");

	onModuleInit() {
	this.updateTokenList()
}

/** This method is passed to the blockgrabber as a callback and checks
 * if we're interested in the contents of the block.
 */
	
public parseBlock = async (update: IBlockParser) => {
	const { block } = update
	const { state, fn, contract: contract_name, timestamp } = block
	// this.logger.log(contract_name)
	this.addToActionQue(saveTransfer, {state, handleClientUpdate:this.socketService.handleClientUpdate})
	try {
		if (contract_name === "submission" && fn === "submit_contract") {
			// Check if the submitted contract is a token, if it's a token, add it to the DB
			const contract_str = getContractCode(state)
			const token_is_valid = validateTokenContract(contract_str)
			const submitted_contract_name = getContractName(state);

			if (submitted_contract_name === config.contractName) {
				this.addToActionQue(updateAmmMeta,{state, handleClientUpdate: this.socketService.handleClientUpdate})
			}
			if (staking_contracts.includes(submitted_contract_name)) {
				this.addToActionQue(updateStakingContractMeta, {state,handleClientUpdate: this.socketService.handleClientUpdate, staking_contract: submitted_contract_name})
			}
			if (token_is_valid) {
				const add_token_dto = prepareAddToken(state)
				const { contract_name, token_seed_holder: vk, base_supply: amount } = add_token_dto

				this.addToActionQue(updateBalance, {
					amount,
					contract_name,
					vk,
				})
				this.addToActionQue(saveToken, add_token_dto)
				this.addToActionQue(this.updateTokenList)
			}
			return
		} else if (contract_name === config.contractName) {
			// handle events for the AMM contract
			this.addToActionQue(this.processAmmBlock, {
				state,
				fn,
				timestamp
			})
			return
		} else if (isUpdateFn(fn)) {
			this.addToActionQue(saveTokenUpdate, state)
		} else if (contract_name === config.identityContract) {
			switch(fn) {
				case 'setName':
				this.addToActionQue(setName,state)
					break
				case 'auth':
				this.authService.authenticate(state)
					break
			}
		} else if (staking_contracts.includes(contract_name) ) {
				this.addToActionQue(updateStakingContractMeta, {state,handleClientUpdate: this.socketService.handleClientUpdate, staking_contract: contract_name})
		}
	} catch (err) {
		this.logger.error(err)
	}
}

processAmmBlock = async (args: { fn: string; state: IKvp[],timestamp: number }) => {
	const { fn, state, timestamp } = args
	try {
		await savePair(state)
		await saveTransfer({state,handleClientUpdate: this.socketService.handleClientUpdate})
		await savePairLp(state)
		await saveUserLp(state)
		await saveReserves(fn, state, this.socketService.handleClientUpdate, timestamp)
		await savePrice(state, this.socketService.handleClientUpdate)
		await updateAmmMeta({state, handleClientUpdate: this.socketService.handleClientUpdate})
	} catch (err) {
		this.logger.error(err)
	}
}

	/** The action que is added to attempt to solve a bug where transactions coming in from the blockgrabber fail to be processed
	 * by the parser. Assuming that it's a race condition causing it, this approach should be effective.
	 */

private executeActionQue = async (action_que: { action: any; args: any }[]) => {
	try {
		if (action_que.length) {
			// this.logger.log(`ACTION QUE PROCESSING ${action_que.length} `)
			const { action, args } = this.action_que[0]
				if (args) {
					await action(args)
				} else {
					await action()
				}
			this.action_que.splice(0, 1)
			this.executeActionQue(action_que)
		} else {
			this.action_que_processing = false
		}
	} catch (err) {
		this.logger.error(err)
		setTimeout(async () => this.executeActionQue(action_que), 1000)
	}
}

private addToActionQue = (action: any, args?) => {
	this.action_que.push({ action, args })
	// this.logger.log(`ADDING ITEM TO ACTION QUE : ${this.action_que.length} ACTIONS OUTSTANDING`)
	if (!this.action_que_processing) {
		this.action_que_processing = true
		this.executeActionQue(this.action_que)
	}
}

private updateTokenList = async (): Promise<void> => {
		const token_list_update = await getTokenList()
		this.token_contract_list = token_list_update
	}
}

const isUpdateFn = (fn: string) => fn === "change_metadata"
