import WalletController from 'lamden_wallet_controller'
import axios from 'axios'
import LamdenJS from 'lamden-js'
import { config, stamps, connectionRequest } from '../config'
import { 
	lwc_info, 
	accountName, 
	ws_id, 
	walletBalance, 
	lamdenWalletAutoConnect, 
	tokenBalances,
	keystore,
	walletAddress
	 } from '../store'
import { get } from 'svelte/store'
import { 
	refreshTAUBalance, 
	refreshLpBalances, 
	setBearerToken, 
	toBigNumber, 
	stringToFixed, 
	stampsToTAU, 
	createBlockExplorerLink,
	setLSValue,
	setLamdenWalletAutoConnectStore,
	removeLpBalances,
	removeTAUBalance,
	removeBearerToken,
	hasSavedKeystoreData,
	getSavedKeystoreData,
	removeLSValue } from '../utils'
import { ToastService } from './toast.service'
import { WsService } from './ws.service'

/** Singleton Wallet Service */

export class WalletService {
	private static _instance: WalletService
	private lwc: WalletController
	private toastService = ToastService.getInstance()
	private wsService = WsService.getInstance()
	private _ws_joined: boolean = false
	private connectionRequest = connectionRequest;
	private installChecker = null;
	private Lamden = LamdenJS
	private keystore = null;

	public static getInstance() {
		if (!WalletService._instance) {
			WalletService._instance = new WalletService()
		}
		return WalletService._instance
	}

	constructor() {
		this.lwc = new WalletController()
		console.log(LamdenJS)

		// events
		this.lwc.events.on('newInfo', this.handleWalletInfo)
		//this.lwc.events.on('txStatus', (res) => console.log(res))
		this.lwc.events.on('installed', this.handleWalletInstalled)

		//Do first check if wallet is installed, folloups will be done by 
		this.installChecker = setInterval(this.checkForIntstalledWallet, 1500)
		//console.log(getSavedKeystoreData())
		if(hasSavedKeystoreData()) this.addKeystoreEncrypted(new this.Lamden.Keystore({keystoreData: getSavedKeystoreData()}))
	}

	private checkForIntstalledWallet = async () => {
		this.lwc.walletIsInstalled().then(res => {
			clearInterval(this.installChecker)
			this.handleWalletInstalled(res)
		})
	}
	public connectToWallet = async () => this.lwc.sendConnection(this.connectionRequest)

	public addKeystoreEncrypted = (encryptedKeystore) => {
		console.log(encryptedKeystore)
		this.keystore = encryptedKeystore
		console.log(this.keystore)
	}
	public addKeystoreDecrypted = (decrytedKeystore) => {
		this.keystore = decrytedKeystore
		keystore.set(this.keystore)
	}
	public decryptKeystore = (password) => {
		if (!this.keystore) throw new Error("No Keystore Data.")
		if (!this.keystore.encryptedData) throw new Error("No Keystore Data.")
		if (!password) throw new Error("Password required to decrypt Keystore.")
		try{
			this.keystore.decryptKeystore(password) 
			if (this.keystore.wallets.length === 0) throw new Error("Keystore is empty.")
			keystore.set(this.keystore)
		}catch (e){
			throw new Error(e.message)
		}
	}

	public removeKeystoreData = () => {
		this.keystore = null
		keystore.set(null)
		removeLSValue('encrypted_keystore_data')
	}

	public conenctToKeystore = () => {
		if (!this.keystore) throw new Error("No Keystore Data.")
		if (this.keystore.wallets.length === 0) throw new Error("Keystore is empty.")
		let vk = this.keystore.wallets[0].vk
		this.getIntialBalances(vk)
		this.joinBalanceFeed(vk)
	}

	private handleWalletInstalled = (e) => {
		lwc_info.set(Object.assign(get(lwc_info), {installed: e}))
	}

	private handleWalletInfo = (e) => {
		if (this.lwc.installed){
			if (this.lwc.approved === false && this.lwc.walletAddress.length > 0 && get(lamdenWalletAutoConnect)) this.connectToWallet();

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
			const { approved, installed, locked } = this.lwc;
			let vk = this.lwc.walletAddress
			if (vk.length > 0 && approved){
				//Get the inital balance 
				this.getIntialBalances(vk)
				this.joinBalanceFeed(vk)
			}
			return Object.assign(current, { approved, installed, locked, walletAddress: vk })
		})
	}

	// Join Websocket Feeds for balance updates
	private joinBalanceFeed = (vk) => {
		if (!this._ws_joined) {
			this.wsService.joinBalanceFeed(vk)
			this._ws_joined = true
		}
	}

	private getIntialBalances = async (vk) => {
		await Promise.all([
			refreshTAUBalance(vk), 
			refreshLpBalances(vk),
			this.getAccountName(vk),
			setBearerToken(vk)
		]).then((res) => console.log(res))
	}

	public logout = () => {
		lwc_info.update(current => {
			current.walletAddress = ""
			current.approved = false
			return current
		})
		this.lwc.walletAddress = ""
		this.lwc.approved = false
		tokenBalances.set({})
		accountName.set(null)
		this.removeKeystoreData()
		removeBearerToken()
		setLSValue("lamden_wallet_autoconnect", false)
		setLamdenWalletAutoConnectStore()
		removeLpBalances()
		removeTAUBalance()
		this.toastService.addToast({ 
			icon: "rocketswapLogo",
			heading: `Goodbye`,
			text: `Let's fly again soon!`, 
			type: 'info',
			duration: 3000
		})
	}

	private getStampCost = async (contractName, method) => {
		let stampsInfo = await axios.get(`${config.blockExplorer}/api/stamps/${contractName}/${method}`)
		let maxStamps = stampsInfo?.data?.max
		if (!maxStamps) maxStamps = stamps.defaultValue
		else maxStamps + stamps.buffer
		return maxStamps
	}

	public estimateTxCosts = async (txInfo) => {
		let results = await Promise.all(txInfo.map(info => this.getStampCost(info.contract, info.method)))
		return results.reduce((a: number, b: number) => a + b, 0)
	}

	private userHasSufficientStamps = (stampCost, callbacks = undefined) => {
		if (stampsToTAU(stampCost) < get(walletBalance)) return true
		if (callbacks) callbacks.error(["Insufficient Stamps"])
		this.insufficientCurrencyForTransactionToast(stampCost)
		return false;
	}

	private createTxInfo = (method, args, stamps, contractName = undefined) => {
		contractName = contractName ? contractName : connectionRequest.contractName
		return {
			contractName,
			methodName: method,
			networkType: connectionRequest.networkType,
			stampLimit: stamps,
			kwargs: args
		}
	}

	private sendTransaction = async (contractName, method, args, callbacks, callback) => {
		let stampCost = await this.getStampCost(contractName, method)
		if (this.userHasSufficientStamps(stampCost, callbacks)){
			if (this.keystore){
				console.log("creating a Lamden Transaction")
				let networkInfo = {
					type: this.connectionRequest.networkType,
					hosts: [config.masternode]
				}
				let txInfo = this.createTxInfo(method, args, stampCost, contractName)
				txInfo.senderVk = this.keystore.wallets[0].vk
				console.log(txInfo)
				let txb = new this.Lamden.TransactionBuilder(networkInfo, txInfo)
				txb.sign(undefined, this.keystore.wallets[0])
				txb.makeTransaction()
				txb.tx.payload.uid = this.Lamden.utils.str2hex(new Date().toISOString())
				console.log(txb)
				console.log(JSON.stringify(txb.tx))
			}
			if (this.lwc.approved){
				this.lwc.sendTransaction(this.createTxInfo(method, args, stampCost, contractName), callback)
			}
		}
	}

	private getAccountName = async (account = undefined) => {
		if (!account) return null
		let body = [{
			"contractName": config.namesContract,
			"variableName": "key_to_name",
			"key": account
		  }]
		const res = await axios.post(`${config.blockExplorer}/api/states/history/getKeys`,body)
		if (res?.data[0]?.value) {
			accountName.set(res.data[0].value)
			this.toastService.addToast({ 
				icon: "rocketswapLogo",
				heading: `Hello ${get(accountName)}!`,
				text: `Welcome back to RocketSwap!`, 
				type: 'info',
				duration: 3000
			})
		}
	}

 	public nameIsTaken = async (name = undefined) => {
		if (!name) return true
		let body = [{
			"contractName": config.namesContract,
			"variableName": "name_to_key",
			"key": name
		  }]
		const res = await axios.post(`${config.blockExplorer}/api/states/history/getKeys`, body)
	
		return res?.data[0]?.value !== null
	}

	public createAccountName = async (name, callbacks = undefined) => {
		this.sendTransaction(
			config.namesContract, 
			"setName", 
			{name}, 
			callbacks, 
			(res) => this.handleCreateAccountName(res, callbacks)
		)
	}

	private handleCreateAccountName = (res, callbacks) => {
		let status = this.txResult(res.data, callbacks)
		if (status === 'success') {
			const checkForName = async () => {
				await this.getAccountName(get(walletAddress));
				if (!get(accountName)){
					setTimeout(checkForName, 1000)
				}else{
					this.toastService.addToast({ 
						icon: "rocketswapLogo",
						heading: `Hello ${get(accountName)}!`,
						text: `You have created a Rocket ID on the blockchain. You can now log into the Troll Box!`, 
						type: 'success',
						duration: 5000,
						link:{
							href: createBlockExplorerLink("transactions", res.data.txHash),
							icon: "popout",
							text: "explorer"
						}
					})
				}
			}
			setTimeout(checkForName, 1000)
			callbacks.success(res)
		}
	}

	public sendAuth = async (callbacks) => {
		this.sendTransaction(
			config.namesContract, 
			"auth", 
			{secret: get(ws_id)}, 
			callbacks, 
			(res) => this.handleAuth(res, callbacks) 
		)
	}

	private handleAuth = (res, callbacks) => {
		let status = this.txResult(res.data, callbacks)
		if (status === 'success') {
			console.log(res.data)
			callbacks.success()
			this.toastService.addToast({ 
				icon: "userAuth",
				heading: `Rocket ID Authenticated!`,
				text: `You can now use the Troll Box. Don't be too much of a Degen.`, 
				type: 'success',
				duration: 5000,
				link:{
					href: createBlockExplorerLink("transactions", res.data.txHash),
					icon: "popout",
					text: "explorer"
				}
			})
		}
	}

	public async createMarket(args, selectedToken, tokenAmount, currencyAmount, callbacks = undefined) {
		let txList = [{contract: connectionRequest.contractName, method: "create_market"}]
		if (await this.needsApproval('currency', currencyAmount)){
			txList.push({contract: 'currency', method: "approve"})
		}
		if (await this.needsApproval(args.contract, tokenAmount)){
			txList.push({contract: args.contract, method: "approve"})
		}
		let totalStampsNeeded = await this.estimateTxCosts(txList)
		if (this.userHasSufficientStamps(totalStampsNeeded, callbacks)){
			let results = await Promise.all([
				this.callApprove(args.contract, tokenAmount),
				this.callApprove('currency', currencyAmount)
			])
	
			if (results.every(v => v === true)){
				this.sendTransaction(
					connectionRequest.contractName, 
					"create_market", 
					args, 
					callbacks, 
					(res) => this.handleCreateMarket(res, selectedToken, callbacks)
				)
			}else{
				if (callbacks) callbacks.error()
			}
		}

	}

	private handleCreateMarket = (res, selectedToken, callbacks=undefined) => {
		let status = this.txResult(res.data, callbacks)
		if (status === 'success') {
			let lpPoints = "0";
			res.data.txBlockResult.state.forEach(stateChange => {
				if (stateChange.key === `${connectionRequest.contractName}.lp_points:${selectedToken.contract_name}:${get(walletAddress)}`){
					lpPoints = stateChange.value.__fixed__ || stateChange.value
				}
			})
			lpPoints = toBigNumber(lpPoints)
			this.toastService.addToast({ 
				icon: "gaugePlus",
				heading: `Created Supply for ${selectedToken.token_symbol}!`,
				text: `You have created liquidity for ${selectedToken.token_name} / ${config.currencySymbol}.`, 
				type: 'success',
				duration: 5000,
				link:{
					href: createBlockExplorerLink("transactions", res.data.txHash),
					icon: "popout",
					text: "explorer"
				}
			})
			callbacks.success()
		}
	}

	public async addLiquidity(args, selectedToken, tokenAmount, currencyAmount, callbacks = undefined) {
		let txList = [{contract: connectionRequest.contractName, method: "add_liquidity"}]
		if (await this.needsApproval('currency', currencyAmount)){
			txList.push({contract: 'currency', method: "approve"})
		}
		if (await this.needsApproval(args.contract, tokenAmount)){
			txList.push({contract: args.contract, method: "approve"})
		}
		let totalStampsNeeded = await this.estimateTxCosts(txList)
		if (this.userHasSufficientStamps(totalStampsNeeded, callbacks)){
			let results = await Promise.all(
				[
					this.callApprove(args.contract, tokenAmount), 
					this.callApprove('currency', currencyAmount)
				]
			)
	
			if (results.every(v => v === true)){
				this.sendTransaction(
					connectionRequest.contractName, 
					"add_liquidity", 
					args, 
					callbacks, 
					(res) => this.handleAddLiquidity(res, selectedToken, callbacks)
				)
			}else{
				if (callbacks) callbacks.error();
			}
		}
	}

	private handleAddLiquidity = (res, selectedToken, callbacks = undefined) => {
		let status = this.txResult(res.data, callbacks)
		if (status === 'success') {
			let lpPoints = '0'
			res.data.txBlockResult.state.forEach((stateChange) => {
				if (stateChange.key === `${this.lwc.connectionRequest.contractName}.lp_points:${selectedToken.contract_name}:${get(walletAddress)}`) {
					lpPoints = stateChange.value.__fixed__ || stateChange.value
				}
			})
			lpPoints = toBigNumber(lpPoints)
			this.toastService.addToast({
				icon: "gaugePlus",
				heading: `Added Liquidity to ${selectedToken.token_symbol}!`,
				text: `You have added liquidity to ${selectedToken.token_name}, your LP Token balance is now ${stringToFixed(lpPoints.toString(), 4)}.`,
				type: 'success',
				duration: 5000,
				link:{
					href: createBlockExplorerLink("transactions", res.data.txHash),
					icon: "popout",
					text: "explorer"
				}
			})
			if (callbacks) callbacks.success()
		}
	}

	public async removeLiquidity(args, selectedToken, callbacks) {
		this.sendTransaction(
			connectionRequest.contractName, 
			"remove_liquidity", 
			args, 
			callbacks, 
			(res) => this.handleRemoveLiquidity(res, selectedToken, callbacks)
		)
	}

	private handleRemoveLiquidity = (res, selectedToken, callbacks = undefined) => {
		let status = this.txResult(res.data, callbacks)
		if (status === 'success') {
			let lpPoints = "0";
			res.data.txBlockResult.state.forEach(stateChange => {
				if (stateChange.key === `${this.lwc.connectionRequest.contractName}.lp_points:${selectedToken.contract_name}:${get(walletAddress)}`){
					lpPoints = stateChange.value.__fixed__ || stateChange.value
				}
			})
			lpPoints = toBigNumber(lpPoints)
			this.toastService.addToast({ 
				icon: "gaugeMinus",
				heading: `Removed Liquidity from ${selectedToken.token_symbol}!`,
				text: `You have removed liquidity from ${selectedToken.token_name}, your LP Token balance is now ${stringToFixed(lpPoints.toString(), 4)}.`, 
				type: 'success',
				duration: 5000,
				link:{
					href: createBlockExplorerLink("transactions", res.data.txHash),
					icon: "popout",
					text: "explorer"
				}
			})
			if (callbacks) callbacks.success()
		}
	}

	public async swapBuy(args, selectedToken, currencyAmount, callbacks = undefined) {
		let txList = [{contract: connectionRequest.contractName, method: "buy"}]
		if (await this.needsApproval('currency', currencyAmount)){
			txList.push({contract: 'currency', method: "approve"})
		}
		let totalStampsNeeded = await this.estimateTxCosts(txList)
		if (this.userHasSufficientStamps(totalStampsNeeded, callbacks)){
			let results = await this.callApprove('currency', currencyAmount)
			if (results){
				this.sendTransaction(
					connectionRequest.contractName, 
					"buy", 
					args, 
					callbacks, 
					(res) => this.handleSwapBuy(res, selectedToken, callbacks)
				)
			}else{
				if (callbacks) callbacks.error();
			}
		}
	}

	private handleSwapBuy = (res, selectedToken, callbacks = undefined) => {
		let status = this.txResult(res.data, callbacks)
		if (status === 'success') {
			this.toastService.addToast({ 
				icon: "buyToken",
				heading: `Swap Completed!`,
				text: `You have swapped ${config.currencySymbol} for ${selectedToken.token_symbol}.`, 
				type: 'success',
				duration: 5000,
				link:{
					href: createBlockExplorerLink("transactions", res.data.txHash),
					icon: "popout",
					text: "explorer"
				}
			})
			if (callbacks) callbacks.success()
		}else{
			if (callbacks) callbacks.error()
		}
	}

	public async swapSell(args, selectedToken, tokenAmount, callbacks = undefined) {
		let txList = [{contract: connectionRequest.contractName, method: "sell"}]
		if (await this.needsApproval(args.contract, tokenAmount)){
			txList.push({contract: args.contract, method: "approve"})
		}
		let totalStampsNeeded = await this.estimateTxCosts(txList)
		if (this.userHasSufficientStamps(totalStampsNeeded, callbacks)){
			let results = await this.callApprove(args.contract, tokenAmount)
			if (results){
				this.sendTransaction(
					connectionRequest.contractName, 
					"sell", 
					args, 
					callbacks, 
					(res) => this.handleSwapSell(res, selectedToken, callbacks)
				)
			}else{
				if (callbacks) callbacks.error()
			}
		}
	}

	private handleSwapSell = (res, selectedToken, callbacks = undefined) => {
		let status = this.txResult(res.data, callbacks)
		if (status === 'success') {
			this.toastService.addToast({ 
				icon: "sellToken",
				heading: `Swap Completed!`,
				text: `You have swapped ${selectedToken.token_symbol} for ${config.currencySymbol}.`, 
				type: 'success',
				duration: 10000,
				link:{
					href: createBlockExplorerLink("transactions", res.data.txHash),
					icon: "popout",
					text: "explorer"
				}
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
			callbacks.error(errors)
		}
	}

	private txResult(txResults, callbacks = undefined) {
		console.log(txResults)
		if (txResults.errors) {
			this.handleTxErrors(txResults.errors, callbacks)
			return txResults.errors
		}
		if (typeof txResults.txBlockResult.status !== 'undefined') {
			if (txResults.txBlockResult.status === 0) {
				setInterval(refreshTAUBalance, 2000)
				setInterval(refreshLpBalances, 2000)
				return 'success'
			}
			if (txResults.txBlockResult.status === 1) {
				this.handleTxErrors(txResults.txBlockResult.errors, callbacks)
				return txResults.txBlockResult.errors
			}
		}
	}

	public getApprovedAmount = async (vk, contract) => {
		return fetch(`${config.masternode}/contracts/${contract}/balances?key=${vk}:${connectionRequest.contractName}`)
				.then((res) => res.json())
				.then((json) => {
					let approval
					if (typeof json?.value?.__fixed__ !== 'undefined') approval = toBigNumber(json.value.__fixed__)
					else approval = toBigNumber(json?.value)
					if (approval.isNaN()) approval = toBigNumber('0')
					return approval
				})
				.catch((e) => console.log(e.message))
	}

	public needsApproval = async (contract, amount) => {
		console.log({contract, amount})
		let approvedAmount = await this.getApprovedAmount(get(walletAddress), contract)
		console.log({approvedAmount, approvedAmountStr: approvedAmount.toString(), needs: approvedAmount.isLessThan(amount)})
		return approvedAmount.isLessThan(amount)
	}

	public async approveBN(contractName, approveAmount, callback = undefined) {
		if (await this.needsApproval(contractName, approveAmount)){
			let args = {
				amount: { __fixed__: "9999999999999" },
				to: connectionRequest.contractName
			}
			this.sendTransaction(
				contractName, 
				"approve", 
				args, 
				null, 
				callback
			)
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
					console.log(res.status)
					if (res.status === "Transaction Cancelled") {
						this.handleTxErrors(res.data.errors)
						resolve(false)
					}
					if (res?.data?.txBlockResult?.status === 0) resolve(true)
					else resolve(false)
				}
			})
		})
	}

	private insufficientCurrencyForTransactionToast = (stampCost) => {
		console.log({stampCost, toTAU: stampsToTAU(stampCost)})
		let currencyAmount = stringToFixed(get(walletBalance), 8)
		this.toastService.addToast({
			heading: `Insufficient ${config.currencySymbol}`,
			text: `It costs ${stampsToTAU(stampCost)} ${config.currencySymbol} to send this transaction and you only have ${currencyAmount} ${config.currencySymbol} in your wallet.`,
			type: 'info',
			duration: 5000
		})
	}
}
