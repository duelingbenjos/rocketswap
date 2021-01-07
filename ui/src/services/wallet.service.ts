import WalletController from 'lamden_wallet_controller'
import { config } from '../config'
import { lwc_info, walletBalance } from '../store'
import { get } from 'svelte/store'
import type { WalletType, WalletErrorType, WalletInitType, WalletConnectedType } from '../types/wallet.types'
import { refreshTAUBalance, toBigNumber, stringToFixed } from '../utils'
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
	private connectionRequest = config;

	public static getInstance() {
		if (!WalletService._instance) {
			WalletService._instance = new WalletService()
		}
		return WalletService._instance
	}

	constructor() {
		this.lwc = new WalletController()

		//lwc_info.subscribe((update) => console.log(update))
		//walletBalance.subscribe((update) => console.log(update))

		// events
		this.lwc.events.on('newInfo', this.handleWalletInfo)
		this.lwc.events.on('txStatus', (res) => console.log(res))
		this.lwc.events.on('installed', (res) => console.log(res))

		//Do first check if wallet is installed, folloups will be done by 
		this.checkForIntstalledWallet()
	}

	private checkForIntstalledWallet = () => this.lwc.walletIsInstalled().then(this.handleWalletInfo)
	public connectToWallet = () => this.lwc.sendConnection(this.connectionRequest)

	private handleWalletInfo = () => {
		//If the wallet wasn't installed schedule another check
		if (!this.lwc.installed){
			setTimeout(this.checkForIntstalledWallet, 1000)
		}else{
			//If the wallet is installed then update the store if new information is passed
			let lwc_info_store = get(lwc_info)
			let results = Object.keys(lwc_info_store).map(key => lwc_info_store[key] === this.lwc[key])
		
			if (results.every((val) => val === true)) return
			this.updateLwcStore()
		}
	 }

	private updateLwcStore = () => {
		if (!this.lwc.installed) return

		lwc_info.update(current => {
			const { approved, installed, locked, walletAddress } = this.lwc;
			if (walletAddress.length > 0 && approved){
				//Get the inital balance 
				refreshTAUBalance(walletAddress).then(balance => walletBalance.set(balance))
				// Join Websocket Feeds for balance updates
				if (!this._ws_joined) {
					this.wsService.joinBalanceFeed(walletAddress)
					this._ws_joined = true
				}
			}
			return Object.assign(current, { approved, installed, locked, walletAddress })
		})
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


	public async createMarket(args, selectedToken, tokenAmount, currencyAmount, callbacks = undefined) {
		let results = await Promise.all([
			this.callApprove(args.contract, tokenAmount),
			this.callApprove('currency', currencyAmount)
		])

		if (results.every(v => v === true)){
			this.lwc.sendTransaction(this.createTxInfo('create_market', args), (res) => this.handleCreateMarket(res, selectedToken, callbacks))
		}else{
			if (callbacks) callbacks.error()
		}
	}

	private handleCreateMarket = (res, selectedToken, callbacks=undefined) => {
		let status = this.txResult(res.data, callbacks)
		if (status === 'success') {
			let lpPoints = "0";
			res.data.txBlockResult.state.forEach(stateChange => {
				if (stateChange.key === `${config.contractName}.lp_points:${selectedToken.contract_name}:${this.lwc.walletAddress}`){
					lpPoints = stateChange.value.__fixed__ || stateChange.value
				}
			})
			lpPoints = toBigNumber(lpPoints)
			this.toastService.addToast({ 
				heading: `Created Supply for ${selectedToken.token_symbol}!`,
				text: `You have created liquidity for ${selectedToken.token_name} / ${config.currencySymbol}.`, 
				type: 'info',
				duration: 10000
			})
			callbacks.success()
		}
	}

	public async addLiquidity(args, selectedToken, tokenAmount, currencyAmount, callbacks = undefined) {
		let results = await Promise.all([this.callApprove(args.contract, tokenAmount), this.callApprove('currency', currencyAmount)])

		if (results.every(v => v === true)){
			this.lwc.sendTransaction(this.createTxInfo('add_liquidity', args), (res) => this.handleAddLiquidity(res, selectedToken, callbacks))
		}else{
			if (callbacks) callbacks.error();
		}
	}

	private handleAddLiquidity = (res, selectedToken, callbacks = undefined) => {
		let status = this.txResult(res.data, callbacks)
		if (status === 'success') {
			let lpPoints = '0'
			res.data.txBlockResult.state.forEach((stateChange) => {
				if (stateChange.key === `${config.contractName}.lp_points:${selectedToken.contract_name}:${this.lwc.walletAddress}`) {
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
			if (callbacks) callbacks.success()
		}
	}

	public async removeLiquidity(args, selectedToken, callbacks) {
		this.lwc.sendTransaction(this.createTxInfo('remove_liquidity', args), (res) => this.handleRemoveLiquidity(res, selectedToken, callbacks))
	}

	private handleRemoveLiquidity = (res, selectedToken, callbacks = undefined) => {
		let status = this.txResult(res.data)
		if (status === 'success') {
			let lpPoints = "0";
			res.data.txBlockResult.state.forEach(stateChange => {
				if (stateChange.key === `${config.contractName}.lp_points:${selectedToken.contract_name}:${this.lwc.walletAddress}`){
					lpPoints = stateChange.value.__fixed__ || stateChange.value
				}
			})
			lpPoints = toBigNumber(lpPoints)
			this.toastService.addToast({ 
				heading: `Removed Liquidity from ${selectedToken.token_symbol}!`,
				text: `You have removed liquidity from ${selectedToken.token_name}, your LP Token balance is now ${stringToFixed(lpPoints.toString(), 4)}.`, 
				type: 'info',
				duration: 10000
			})
			if (callbacks) callbacks.success()
		}
	}

	public async swapBuy(args, selectedToken, currencyAmount, tokenAmount, callbacks = undefined) {
		let results = await this.callApprove('currency', currencyAmount)
		if (results){
			this.lwc.sendTransaction(this.createTxInfo('buy', args), (res) => this.handleSwapBuy(res, selectedToken, callbacks))
		}else{
			if (callbacks) callbacks.error();
		}
	}

	private handleSwapBuy = (res, selectedToken, callbacks = undefined) => {
		let status = this.txResult(res.data)
		if (status === 'success') {
			this.toastService.addToast({ 
				heading: `Swap Completed!`,
				text: `You have swapped ${config.currencySymbol} for ${selectedToken.token_symbol}.`, 
				type: 'info',
				duration: 10000
			})
			if (callbacks) callbacks.success()
		}
	}

	public async swapSell(args, selectedToken, currencyAmount, tokenAmount, callbacks = undefined) {
		let results = await this.callApprove(args.contract, tokenAmount)
		if (results){
			this.lwc.sendTransaction(this.createTxInfo('sell', args), (res) => this.handleSwapSell(res, selectedToken, callbacks))
		}else{
			if (callbacks) callbacks.error();
		}
	}

	private handleSwapSell = (res, selectedToken, callbacks = undefined) => {
		let status = this.txResult(res.data)
		if (status === 'success') {
			this.toastService.addToast({ 
				heading: `Swap Completed!`,
				text: `You have swapped ${selectedToken.token_symbol} for ${config.currencySymbol}.`, 
				type: 'info',
				duration: 10000
			})
			if (callbacks) callbacks.success()
		}
	}

	private handleTxErrors(errors, callback = undefined){
		errors.forEach(error => {
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
		if (callback) callback.error()
	}

	private txResult(txResults, callback = undefined) {
		console.log(txResults)
		if (txResults.errors) {
			this.handleTxErrors(txResults.errors, callback)
			return txResults.errors
		}
			if (typeof txResults.txBlockResult.status !== 'undefined') {
			if (txResults.txBlockResult.status === 0) return 'success'
			if (txResults.txBlockResult.status === 1) {
				this.handleTxErrors(txResults.txBlockResult.errors, callback)
				return txResults.txBlockResult.errors
			}
		}
	}

	public async approveBN(contractName, approveAmount, callback = undefined) {
		let currentApproval = await this.getApprovedAmount(this.lwc.walletAddress, contractName)
		if (typeof currentApproval?.__fixed__ !== 'undefined') currentApproval = toBigNumber(currentApproval.__fixed__)
		else currentApproval = toBigNumber(currentApproval)
		if (currentApproval.isNaN()) currentApproval = toBigNumber('0')
			let adjustedApprovalAmount = approveAmount.minus(currentApproval)
			if (adjustedApprovalAmount.isGreaterThan(toBigNumber("0"))){
				let args = {
					amount: { __fixed__: stringToFixed(adjustedApprovalAmount.toString(), 30) },
					to: config.contractName
				}
			this.lwc.sendTransaction(this.createTxInfo('approve', args, contractName), callback)
		} else {
			if (callback) callback(true)
		}
	}

	private callApprove (contract, amount) {
		return new Promise((resolve) => {
			this.approveBN(contract, amount, (res, err) => {
				if (err || !res) resolve(false)
				if (res === true) resolve(true)
				else {
					if (res?.data?.txBlockResult?.status === 0) resolve(true)
					else resolve(false)
				}
			})
		})
	}
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
