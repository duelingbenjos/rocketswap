import { Injectable, Logger } from "@nestjs/common"
import { IKvp } from "./types/misc.types"
import { config } from "./config"
import { getTokenList, prepareAddToken, saveToken, saveTokenUpdate } from "./entities/token.entity"
import { getContractCode, validateTokenContract } from "./utils"
import { saveTransfer, updateBalance } from "./entities/balance.entity"
import { savePair, savePairLp, saveReserves } from "./entities/pair.entity"
import { saveUserLp } from "./entities/lp-points.entity"
import { savePrice } from "./entities/price.entity"
import { IBlockParser } from "./types/websocket.types"
import { SocketService } from "./socket.service"
import { setName } from "./entities/name.entity"
import { AuthService } from "./authentication/trollbox.service"

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
  try {
   if (contract_name === "submission" && fn === "submit_contract") {
    // Check if the submitted contract is a token, if it's a token, add it to the DB
    const contract_str = getContractCode(state)
    const token_is_valid = validateTokenContract(contract_str)
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
    await this.updateTokenList()
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
   } else if (this.token_contract_list.includes(contract_name)) {
    await saveTransfer(state, this.socketService.handleClientUpdate)
    if (isUpdateFn(fn)) {
     await saveTokenUpdate(state)
    }
   } else if (contract_name === config.identityContract) {
     switch(fn) {
       case 'setName':
        this.addToActionQue(setName,state)
        break
        case 'auth':
          this.authService.authenticate(state)
        break
     }
   }
  } catch (err) {
   this.logger.error(err)
  }
 }

 processAmmBlock = async (args: { fn: string; state: IKvp[],timestamp: number }) => {
  const { fn, state, timestamp } = args
  try {
   await savePair(state)
   await saveTransfer(state, this.socketService.handleClientUpdate)
   await savePairLp(state)
   await saveUserLp(state)
   await saveReserves(fn, state, this.socketService.handleClientUpdate, timestamp)
   await savePrice(state, this.socketService.handleClientUpdate)
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
    this.logger.log(`ACTION QUE PROCESSING ${action_que.length} `)
    const { action, args } = this.action_que[0]
		if (args) {
			await action(args)
		} else {
			action()
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
  this.logger.log(`ADDING ITEM TO ACTION QUE : ${this.action_que.length} ACTIONS OUTSTANDING`)
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

const isUpdateFn = (fn: string) => fn === "set_logo" || fn === "set_name" || fn === "set_symbol"
