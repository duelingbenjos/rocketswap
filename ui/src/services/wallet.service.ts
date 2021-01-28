import WalletController from 'lamden_wallet_controller'
import { config } from '../config'
import { lwc_info, walletBalance, lpBalances } from '../store'
import { get } from 'svelte/store'
import type { WalletType, WalletErrorType, WalletInitType, WalletConnectedType } from '../types/wallet.types'
import { refreshTAUBalance, refreshLpBalances, toBigNumber, stringToFixed } from '../utils'
import { ToastService } from './toast.service'
import { WsService } from './ws.service'

/** Singleton Wallet Service */

export class WalletService {
	private static _instance: WalletService
	private lwc: WalletController
	private toastService = ToastService.getInstance()
	private wsService = WsService.getInstance()
	private _ws_joined: boolean = false
	private connectionRequest = config;
	private installChecker = null;

	public static getInstance() {
		if (!WalletService._instance) {
			WalletService._instance = new WalletService()
		}
		return WalletService._instance
	}

	constructor() {
		this.lwc = new WalletController()

		// events
		this.lwc.events.on('newInfo', this.handleWalletInfo)
		//this.lwc.events.on('txStatus', (res) => console.log(res))
		this.lwc.events.on('installed', this.handleWalletInstalled)

		//Do first check if wallet is installed, folloups will be done by 
		this.installChecker = setInterval(this.checkForIntstalledWallet, 1500)
	}

	private checkForIntstalledWallet = async () => {
		this.lwc.walletIsInstalled().then(res => {
			clearInterval(this.installChecker)
			this.handleWalletInstalled(res)
		})
	}
	public connectToWallet = async () => this.lwc.sendConnection(this.connectionRequest)

	private handleWalletInstalled = (e) => {
		lwc_info.set(Object.assign(get(lwc_info), {installed: e}))
	}

	private handleWalletInfo = (e) => {
		if (this.lwc.installed){
			if (this.lwc.approved === false && this.lwc.walletAddress.length > 0) this.connectToWallet();

			//If the wallet is installed then update the store if new information is passed
			let lwc_info_store = get(lwc_info)
			let results = Object.keys(lwc_info_store).map(key => lwc_info_store[key] === this.lwc[key])
		
			if (results.every((val) => val === true)) return
			this.updateLwcStore()
		}
	 }

	private updateLwcStore = async () => {
		if (!this.lwc.installed) return

		lwc_info.update(current => {
			const { approved, installed, locked, walletAddress } = this.lwc;
			console.log('get initial balances?')
			console.log(walletAddress.length > 0 && approved)
			if (walletAddress.length > 0 && approved){
				//Get the inital balance 
				this.getIntialBalances(walletAddress)
				// Join Websocket Feeds for balance updates
				console.log('ws_joined', this._ws_joined)
				if (!this._ws_joined) {
					this.wsService.joinBalanceFeed(walletAddress)
					this._ws_joined = true
					console.log('ws_joined', this._ws_joined)
				}
			}
			return Object.assign(current, { approved, installed, locked, walletAddress })
		})
	}
	private getIntialBalances = async (walletAddress) => {
		await Promise.all([refreshTAUBalance(walletAddress), refreshLpBalances(walletAddress)])
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
				type: 'success',
				duration: 7000
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
				if (stateChange.key === `${this.lwc.connectionRequest.contractName}.lp_points:${selectedToken.contract_name}:${this.lwc.walletAddress}`) {
					lpPoints = stateChange.value.__fixed__ || stateChange.value
				}
			})
			lpPoints = toBigNumber(lpPoints)
			this.toastService.addToast({
				heading: `Added Liquidity to ${selectedToken.token_symbol}!`,
				text: `You have added liquidity to ${selectedToken.token_name}, your LP Token balance is now ${stringToFixed(lpPoints.toString(), 4)}.`,
				type: 'success',
				duration: 7000
			})
			if (callbacks) callbacks.success()
		}
	}

	public async removeLiquidity(args, selectedToken, callbacks) {
		this.lwc.sendTransaction(this.createTxInfo('remove_liquidity', args), (res) => this.handleRemoveLiquidity(res, selectedToken, callbacks))
	}

	private handleRemoveLiquidity = (res, selectedToken, callbacks = undefined) => {
		let status = this.txResult(res.data, callbacks)
		if (status === 'success') {
			let lpPoints = "0";
			res.data.txBlockResult.state.forEach(stateChange => {
				if (stateChange.key === `${this.lwc.connectionRequest.contractName}.lp_points:${selectedToken.contract_name}:${this.lwc.walletAddress}`){
					lpPoints = stateChange.value.__fixed__ || stateChange.value
				}
			})
			lpPoints = toBigNumber(lpPoints)
			this.toastService.addToast({ 
				heading: `Removed Liquidity from ${selectedToken.token_symbol}!`,
				text: `You have removed liquidity from ${selectedToken.token_name}, your LP Token balance is now ${stringToFixed(lpPoints.toString(), 4)}.`, 
				type: 'success',
				duration: 7000
			})
			if (callbacks) callbacks.success()
		}
	}

	public async swapBuy(args, selectedToken, currencyAmount, callbacks = undefined) {
		let results = await this.callApprove('currency', currencyAmount)
		if (results){
			this.lwc.sendTransaction(this.createTxInfo('buy', args), (res) => this.handleSwapBuy(res, selectedToken, callbacks))
		}else{
			if (callbacks) callbacks.error();
		}
	}

	private handleSwapBuy = (res, selectedToken, callbacks = undefined) => {
		let status = this.txResult(res.data, callbacks)
		if (status === 'success') {
			this.toastService.addToast({ 
				heading: `Swap Completed!`,
				text: `You have swapped ${config.currencySymbol} for ${selectedToken.token_symbol}.`, 
				type: 'success',
				duration: 7000
			})
			if (callbacks) callbacks.success()
		}
	}

	public async swapSell(args, selectedToken, tokenAmount, callbacks = undefined) {
		let results = await this.callApprove(args.contract, tokenAmount)
		if (results){
			this.lwc.sendTransaction(this.createTxInfo('sell', args), (res) => this.handleSwapSell(res, selectedToken, callbacks))
		}else{
			if (callbacks) callbacks.error();
		}
	}

	private handleSwapSell = (res, selectedToken, callbacks = undefined) => {
		let status = this.txResult(res.data, callbacks)
		if (status === 'success') {
			this.toastService.addToast({ 
				heading: `Swap Completed!`,
				text: `You have swapped ${selectedToken.token_symbol} for ${config.currencySymbol}.`, 
				type: 'success',
				duration: 10000
			})
			if (callbacks) callbacks.success()
		}
	}

	private handleTxErrors(errors, callbacks = undefined){
		errors.forEach(error => {
			let toastType = 'info'
			console.log(JSON.stringify(error))
			if (error.includes("AssertionError('")) {
				let match = error.match(/AssertionError\('(.*)',\)/)
				if (match){
					error = match[1]
					toastType = 'error'
				}else return
			}
			if (error.includes('AssertionError("')) {
				let match = error.match(/AssertionError\("(.*)",\)/)
				if (match){
					error = match[1]
					toastType = 'error'
				}else return
			}
			this.toastService.addToast({
				heading: 'Transaction Error.',
				type: toastType === 'info' ? 'info' : 'error',
				text: error
			})
		})
		if (callbacks) {
			console.log("calling error callback! ")
			console.log(callbacks)
			callbacks.error()
		}
	}

	private txResult(txResults, callbacks = undefined) {
		console.log(txResults)
		if (txResults.errors) {
			this.handleTxErrors(txResults.errors, callbacks)
			return txResults.errors
		}
		if (typeof txResults.txBlockResult.status !== 'undefined') {
			if (txResults.txBlockResult.status === 0) return 'success'
			if (txResults.txBlockResult.status === 1) {
				this.handleTxErrors(txResults.txBlockResult.errors, callbacks)
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
