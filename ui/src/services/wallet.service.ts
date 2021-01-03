import WalletController from 'lamden_wallet_controller'
import { ApiService } from './api.service'
import { config } from '../config'
import { show_swap_confirm, swap_confirm_loading, wallet_store } from '../store'
import type { WalletType, WalletErrorType, WalletInitType, WalletConnectedType } from '../types/wallet.types'
import { refreshTAUBalance, returnFloat, toBigNumber, stringToFixed } from '../utils'
import { ToastService } from './toast.service'
import { WsService } from './ws.service'

/** Singleton Wallet Service */

export class WalletService {
  private static _instance: WalletService
  private wallet_state: WalletType
  private lwc: WalletController
  private toastService = ToastService.getInstance()
  private wsService = WsService.getInstance()
  private _ws_joined: boolean = false

  public static getInstance() {
    if (!WalletService._instance) {
      WalletService._instance = new WalletService()
    }
    return WalletService._instance
  }

  constructor() {
    this.lwc = new WalletController(config)
    wallet_store.subscribe((update) => {
      this.wallet_state = { ...this.wallet_state, ...update }
    })

    // events
    this.lwc.events.on('newInfo', this.handleWalletInfo)
    this.lwc.events.on('txStatus', handleTxResults)
    setTimeout(() => {
      this.lwc.walletIsInstalled().then((installed) => {
        if (!installed) {
          console.info('wallet not installed')
          this.setNotInstalledError()
        }
      }, 1000)
    })

    setInterval(() => {
      if (isWalletConnected(this.wallet_state) && this.wallet_state.wallets[0]) {
        this.updateBalances(this.wallet_state.wallets[0])
      } else if (isWalletError(this.wallet_state)) {
        // To Do finish this.
      }
    }, 1000)
  }

  private setNotInstalledError() {
    console.log('wallet not installed error')
    setTimeout(() => {
      // console.log(this.wallet_state)
      if (!isWalletConnected(this.wallet_state) && !isWalletError(this.wallet_state)) {
        wallet_store.set({ errors: ['not_installed'] })
      }
    }, 3000)
  }

  private handleWalletInfo = async (wallet_update: WalletType) => {
    let wallet_info: WalletType
    // console.log(wallet_info)
    if (isWalletConnected(wallet_update)) {
      wallet_info = wallet_update
      if (wallet_info.wallets[0]) {
        const vk = wallet_info.wallets[0]

        wallet_info.balance = await refreshTAUBalance(vk)

        // Join Websocket Feeds
        if (!this._ws_joined) {
          this.wsService.joinBalanceFeed(vk)
          this._ws_joined = true
        }
      }
      delete (this.wallet_state as WalletInitType).init
    } else {
      wallet_info = wallet_update
    }
    wallet_store.set(wallet_info)
  }

  private async updateBalances(vk?: string) {
    if (isWalletConnected(this.wallet_state)) {
      let prev = JSON.stringify(this.wallet_state)
      // this.wallet_state.tokens = res[0]
      this.wallet_state.balance = await refreshTAUBalance(vk)

      // only update the store if state changed
      // if (prev !== JSON.stringify(this.wallet_state))
      wallet_store.update((state) => {
        return { ...state, ...this.wallet_state }
      })

      //const lpRes = await this.apiService.getUserLpBalance(vk)
      //if (lpRes) this.wallet_state.lp_balances = lpRes
    }
  }

  private createTxInfo(method: string, args, contractName = undefined) {
    return {
      contractName,
      methodName: method,
      networkType: config.networkType,
      stampLimit: 100, //TODO Populate with blockexplorer stamp info endpoint
      kwargs: args
    }
  }

  getApprovedAmount = async (vk: string, contract: string) => {
    return fetch(`${config.masternode}/contracts/${contract}/balances?key=${vk}:${config.contractName}`)
      .then((res) => res.json())
      .then((json) => json.value)
      .catch((e) => console.log(e.message))
  }

  approve = async (amount: number, contract_name: string) => {
    const transaction = {
      contractName: contract_name, // The contract which we're calling approve() on
      methodName: 'approve',
      networkType: config.networkType,
      kwargs: {
        amount,
        to: config.contractName // AMM contract
      },
      stampLimit: 150
    }
    console.log(transaction)
    const prom = new Promise((resolve, reject) => {
      this.lwc.sendTransaction(transaction, (res) => {
        console.log(res)
        if (res.status === 'success') {
          this.toastService.addToast({ heading: 'Approval Successful.', text: `Approved ${amount} for transfer from ${contract_name}`, type: 'info' })
          resolve(res)
        } else reject(res)
      })
    })
    return prom
  }

  public async buy(vk: string, currency_amount: number, contract_name: string) {
    try {
      swap_confirm_loading.set(true)
      await this.approveDifference(vk, currency_amount, 'currency')
      const tx_info = this.createTxInfo('buy', { currency_amount: returnFloat(currency_amount), contract: contract_name })
      console.log('sending buy transaction')
      this.lwc.sendTransaction(tx_info, this.handleSwapResult)
    } catch (err) {
      console.log(err)
      show_swap_confirm.set(false)
      swap_confirm_loading.set(false)
      console.log(err)
      let err_message = err.data.resultInfo?.errorInfo[0] ? err.data.resultInfo?.errorInfo[0] : err.data.status
      this.toastService.addToast({ heading: 'Transaction Failed.', text: err_message, type: 'error' })
      console.error(err)
    }
  }

  public async sell(vk: string, args: { token_amount: number; contract: string }) {
    swap_confirm_loading.set(true)
    try {
      const { token_amount, contract } = args
      await this.approveDifference(vk, token_amount, contract)
      this.lwc.sendTransaction(this.createTxInfo('sell', args), this.handleSwapResult)
    } catch (err) {
      this.handleSwapError(err)
    }
  }

  private async handleSwapError(err) {
    show_swap_confirm.set(false)
    swap_confirm_loading.set(false)
    this.toastService.addToast({ heading: 'Transaction Failed.', text: err.data.resultInfo.errorInfo[0], type: 'error' })
    console.error(err)
  }

  private handleSwapResult = (res) => {
    swap_confirm_loading.set(false)
    show_swap_confirm.set(false)
    this.toastService.addToast({ heading: 'Transaction Succeeded.', type: 'info' })
  }

  private async approveDifference(vk: string, amount: number, contract_name: string) {
    let approved_amount = await this.getApprovedAmount(vk, contract_name)
    if (approved_amount && approved_amount.__fixed__) approved_amount = approved_amount.__fixed__
    approved_amount = approved_amount ? parseFloat(approved_amount) : 0
    let approve_amount = amount - (approved_amount as number)
    if (approve_amount <= 0) return
    await this.approve(approve_amount, contract_name)
    this.toastService.addToast({ heading: 'Approval succeeded !', text: `You have approved ${approve_amount} tokens.`, type: 'info' })
  }

  public async createMarket(args) {
    this.lwc.sendTransaction(this.createTxInfo('create_market', args), this.handleCreateMarket)
  }

  private handleCreateMarket = (res) => {
    let status = this.txResult(res.data)
    if (status === 'success') {
      this.toastService.addToast({ heading: 'Transaction Succeeded.', type: 'info' })
    }
  }

  public async addLiquidity(args, selectedToken, tokenAmount, currencyAmount) {
    const callApprove = (contract, amount) => {
      return new Promise((resolve) => {
        this.approveBN(contract, amount, (res, err) => {
          console.log({ contract, amount, res, err })
          if (err || !res) resolve(false)
          if (res === true) resolve(true)
          else {
            if (res?.data?.txBlockResult?.status === 0) resolve(true)
            else resolve(false)
          }
        })
      })
    }

    let results = await Promise.all([callApprove(args.contract, tokenAmount), callApprove('currency', currencyAmount)])

    console.log(results)

    if (results.every((v) => v === true)) {
      this.lwc.sendTransaction(this.createTxInfo('add_liquidity', args), (res) => this.handleAddLiquidity(res, selectedToken))
    }
  }

  private handleAddLiquidity = (res, selectedToken) => {
    console.log({ res, selectedToken })
    let status = this.txResult(res.data)
    if (status === 'success') {
      let lpPoints = '0'
      res.data.txBlockResult.state.forEach((stateChange) => {
        if (stateChange.key === `${config.contractName}.lp_points:${selectedToken.contract_name}:${(this.wallet_state as WalletConnectedType).wallets[0]}`) {
          lpPoints = stateChange.value.__fixed__ || stateChange.value
        }
      })
      lpPoints = toBigNumber(lpPoints)
      this.toastService.addToast({
        heading: `Added Liquidity to ${selectedToken.token_symbol}!`,
        text: `You have added liquidity to ${selectedToken.token_name}, your LP Token balance is now ${stringToFixed(lpPoints.toString(), 4)}.`,
        type: 'info',
        duration: 10000
      })
    }
  }

  private handleTxErrors(errors) {
    errors.forEach((error) => {
      let toastType = 'info'
      if (error.includes('AssertionError')) {
        error = error.split("'")[1]
        toastType = 'error'
      }
      this.toastService.addToast({
        heading: 'Transaction Error.',
        type: toastType === 'info' ? 'info' : 'error',
        text: error
      })
    })
  }

  private txResult(txResults) {
    if (txResults.errors) {
      this.handleTxErrors(txResults.errors)
      return txResults.errors
    }
    if (typeof txResults.txBlockResult.status !== 'undefined') {
      if (txResults.txBlockResult.status === 0) return 'success'
      if (txResults.txBlockResult.status === 1) {
        this.handleTxErrors(txResults.txBlockResult.errors)
        return txResults.txBlockResult.errors
      }
    }
  }

  public async approveBN(contractName, approveAmount, callback = undefined) {
    let vk = (this.wallet_state as WalletConnectedType).wallets[0]
    let currentApproval = await this.getApprovedAmount(vk, contractName)
    if (typeof currentApproval?.__fixed__ !== 'undefined') currentApproval = toBigNumber(currentApproval.__fixed__)
    else currentApproval = toBigNumber(currentApproval)
    if (currentApproval.isNaN()) currentApproval = toBigNumber('0')

    let adjustedApprovalAmount = approveAmount.minus(currentApproval)
    console.log({ adjustedApprovalAmount: adjustedApprovalAmount.toString(), currentApproval: currentApproval.toString() })
    if (adjustedApprovalAmount.isGreaterThan(toBigNumber('0'))) {
      let args = {
        amount: { __fixed__: adjustedApprovalAmount.toString() },
        to: config.contractName
      }
      this.lwc.sendTransaction(this.createTxInfo('approve', args, contractName), callback)
    } else {
      callback(true)
    }
  }
}

async function handleTxResults(txInfo) {
  //console.log(txInfo)
}

export function isWalletError(wallet_info: WalletType): wallet_info is WalletErrorType {
  return (wallet_info as WalletErrorType).errors !== undefined
}

export function isWalletInit(wallet_info: WalletType): wallet_info is WalletInitType {
  return (wallet_info as WalletInitType).init !== undefined
}

export function isWalletConnected(wallet_info: WalletType): wallet_info is WalletConnectedType {
  return (wallet_info as WalletConnectedType)?.wallets !== undefined
}
