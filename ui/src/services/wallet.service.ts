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
	keystore,
	walletAddress
	 } from '../store'
import { get } from 'svelte/store'
import { 
	setBearerToken, 
	toBigNumber, 
	stringToFixed, 
	stampsToTAU, 
	createBlockExplorerLink,
	setLSValue,
	setLamdenWalletAutoConnectStore,
	removeBearerToken,
	hasSavedKeystoreData,
	getSavedKeystoreData,
	removeLSValue,
	getAmmStakeDetails } from '../utils'
import { ToastService } from './toast.service'
import { WsService } from './ws.service'
import { ApiService } from './api.service'

/** Singleton Wallet Service */

export class WalletService {
	private static _instance: WalletService
	private lwc: WalletController
	private toastService = ToastService.getInstance()
	private wsService = WsService.getInstance()
	private apiService = ApiService.getInstance()
	private _ws_joined: boolean = false
	private connectionRequest = connectionRequest;
	private installChecker = null;
	private Lamden = LamdenJS;
	private keystore = null;
	private maxApprovalAmount = "99999999999999999999999999999"

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
		this.lwc.events.on('installed', this.handleWalletInstalled)

		//Do first check if wallet is installed, folloups will be done by 
		this.installChecker = setInterval(this.checkForIntstalledWallet, 1500)
		setLamdenWalletAutoConnectStore()

		if(hasSavedKeystoreData()) this.addKeystoreEncrypted(new this.Lamden.Keystore({keystoreData: getSavedKeystoreData()}))
	}

	private checkForIntstalledWallet = async () => {
		console.log("checkForIntstalledWalled")
		this.lwc.walletIsInstalled().then(res => {
			clearInterval(this.installChecker)
			this.handleWalletInstalled(res)
		})
	}
	public connectToWallet = async () => this.lwc.sendConnection(this.connectionRequest)

	public addKeystoreEncrypted = (encryptedKeystore) => {
		this.keystore = encryptedKeystore
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
		this.joinUserFeeds(vk)
	}

	private handleWalletInstalled = (e) => {
		lwc_info.set(Object.assign(get(lwc_info), {installed: e}))
	}

	private handleWalletInfo = (e) => {
		//console.log(JSON.parse(JSON.stringify({e, lwc: this.lwc, lwc_store: get(lwc_info)})))
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
				this.joinUserFeeds(vk)
			}
			return Object.assign(current, { approved, installed, locked, walletAddress: vk })
		})
	}

	private joinUserFeeds = (vk) => {
		this.wsService.joinBalanceFeed(vk)
		this.wsService.joinUserLpBalancesFeed(vk)
		this.wsService.joinUserYieldFeed(vk)
	}

	private leaveUserFeeds = (vk) => {
		this.wsService.leaveBalanceFeed(vk)
		this.wsService.leaveUserLpBalanceFeed(vk)
		this.wsService.leaveUserYieldFeed(vk)
	}

	public logout = () => {
		this.leaveUserFeeds(get(walletAddress))
		lwc_info.update(current => {
			current.walletAddress = ""
			current.approved = false
			return current
		})
		this.lwc.walletAddress = ""
		this.lwc.approved = false
		accountName.set(null)
		this.removeKeystoreData()
		removeBearerToken()
		setLSValue("lamden_wallet_autoconnect", false)
		setLamdenWalletAutoConnectStore()
		
		this.toastService.addToast({ 
			icon: "rocketswapLogo",
			heading: `Goodbye`,
			text: `Let's fly again soon!`, 
			type: 'info',
			duration: 3000
		})
	}

	private getIntialBalances = async (vk) => {
		await Promise.all([
			// this.getAccountName(vk),
			// setBearerToken(vk),
			getAmmStakeDetails(vk)
		])
	}

	private getStampCost = async (contractName, method) => {
		let maxStamps = stamps[method]
		if (!maxStamps) maxStamps = stamps.defaultValue
		return maxStamps + stamps.buffer
	}

	public estimateTxCosts = async (txInfo) => {
		let results = await Promise.all(txInfo.map(info => this.getStampCost(info.contract, info.method)))
		return results.reduce((a: number, b: number) => a + b, 0)
	}

	private userHasSufficientStamps = (stampCost, callbacks = undefined) => {
		if (stampsToTAU(stampCost).isLessThan(get(walletBalance))) return true
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

	private sendTransaction = async (contractName, method, args, callbacks, callback, stampCost = undefined) => {
		if (!stampCost) stampCost = await this.getStampCost(contractName, method)
		if (this.userHasSufficientStamps(stampCost, callbacks)){
			if (this.keystore){
				let networkInfo = {
					type: this.connectionRequest.networkType,
					hosts: [config.masternode]
				}
				let txInfo = this.createTxInfo(method, args, stampCost, contractName)
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
  				// @ts-ignore
				txInfo.senderVk = this.keystore.wallets[0].vk
				let txb = new this.Lamden.TransactionBuilder(networkInfo, txInfo)
				txb.getNonce().then(() => {
					txb.sign(undefined, this.keystore.wallets[0])
					txb.makeTransaction()
					txb.tx.payload.uid = this.Lamden.utils.str2hex(new Date().toISOString())
					this.wsService.sendProxyTxn(txb.tx, callback)
				})
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
		const res = await axios.post(`${config.blockExplorer}/api/states/history/getKeys`,body).catch(err => console.log(err))
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
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
		const res = await axios.post(`${config.blockExplorer}/api/states/history/getKeys`, body).catch(err => console.log(err))
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
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
			res?.data?.txBlockResult?.state?.forEach(stateChange => {
				if (stateChange.key === `${connectionRequest.contractName}.lp_points:${selectedToken.contract_name}:${get(walletAddress)}`){
					lpPoints = stateChange.value.__fixed__ || stateChange.value
				}
			})
			lpPoints = toBigNumber(lpPoints)
			this.toastService.addToast({ 
				icon: "gaugePlus",
				heading: `Created Supply for ${selectedToken.token_name}!`,
				text: `You have created liquidity for ${selectedToken.token_symbol} / ${config.currencySymbol}.`, 
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
			res?.data?.txBlockResult?.state?.forEach((stateChange) => {
				if (stateChange.key === `${config.ammContractName}.lp_points:${selectedToken.contract_name}:${get(walletAddress)}`) {
					lpPoints = stateChange.value.__fixed__ || stateChange.value
				}
			})
			lpPoints = toBigNumber(lpPoints)
			this.toastService.addToast({
				icon: "gaugePlus",
				heading: `Added Liquidity to ${selectedToken.token_name}!`,
				text: `Your ${selectedToken.token_symbol} / ${config.currencySymbol} LP Token balance is now ${stringToFixed(lpPoints, 4)}.`,
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
			res?.data?.txBlockResult?.state?.forEach(stateChange => {
				if (stateChange.key === `${config.ammContractName}.lp_points:${selectedToken.contract_name}:${get(walletAddress)}`){
					lpPoints = stateChange.value.__fixed__ || stateChange.value
				}
			})
			lpPoints = toBigNumber(lpPoints)
			this.toastService.addToast({ 
				icon: "gaugeMinus",
				heading: `Removed Liquidity from ${selectedToken.token_symbol}!`,
				text: `You have removed liquidity from ${selectedToken.token_name}, your LP Token balance is now ${stringToFixed(lpPoints, 4)}.`, 
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

	public async swapBuy(args, selectedToken, currencyAmount, rswp_fee_amount, callbacks = undefined) {
		let txList = [{contract: connectionRequest.contractName, method: "buy"}]

		const { token_fees } = args

		if (token_fees){
			if (await this.needsApproval(config.ammTokenContract, rswp_fee_amount, config.ammContractName)){
				txList.push({contract: config.ammTokenContract, method: "approve"})
			}
		}
		if (await this.needsApproval('currency', currencyAmount)){
			txList.push({contract: 'currency', method: "approve"})
		}
		let totalStampsNeeded = selectedToken.contract_name === "con_reflecttau" || "con_reflecttau_v2" ? 350 : await this.estimateTxCosts(txList)
		if (this.userHasSufficientStamps(totalStampsNeeded, callbacks)){
			if (token_fees){
				let rswp_approve_results = await this.callApprove(config.ammTokenContract, rswp_fee_amount, config.ammContractName)
				if(!rswp_approve_results){
					if (callbacks) callbacks.error();
					return
				}
			}
			let results = await this.callApprove('currency', currencyAmount)
			if (results){
				this.sendTransaction(
					connectionRequest.contractName, 
					"buy", 
					args, 
					callbacks, 
					(res) => this.handleSwapBuy(res, selectedToken, callbacks),
					totalStampsNeeded
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
		}
	}

	public async swapSell(args, selectedToken, tokenAmount, rswp_fee_amount, callbacks = undefined) {
		let txList = [{contract: connectionRequest.contractName, method: "sell"}]

		const { token_fees } = args

		if (token_fees){
			if (await this.needsApproval(config.ammTokenContract, rswp_fee_amount, config.ammContractName)){
				txList.push({contract: config.ammTokenContract, method: "approve"})
			}
		}

		if (await this.needsApproval(args.contract, tokenAmount)){
			txList.push({contract: args.contract, method: "approve"})
		}
		let totalStampsNeeded = selectedToken.contract_name === "con_reflecttau" || "con_reflecttau_v2" ? 350 : await this.estimateTxCosts(txList)
		if (this.userHasSufficientStamps(totalStampsNeeded, callbacks)){
			if (token_fees){
				let rswp_approve_results = await this.callApprove(config.ammTokenContract, rswp_fee_amount, config.ammContractName)
				if(!rswp_approve_results){
					if (callbacks) callbacks.error();
					return
				}
			}
			let results = await this.callApprove(args.contract, tokenAmount)
			if (results){
				this.sendTransaction(
					connectionRequest.contractName, 
					"sell", 
					args, 
					callbacks, 
					(res) => this.handleSwapSell(res, selectedToken, callbacks),
					totalStampsNeeded
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

	public async stakeTokens(stakingContractName, args, stakingToken, yieldToken, isLpToken, callbacks = undefined) {
		let txList = [{contract: stakingContractName, method: "addStakingTokens"}]
		if (isLpToken){
			let needs_approval = await this.needsApproval_LP(stakingToken.contract_name, args.amount.__fixed__, stakingContractName)
			if (await this.needsApproval_LP(stakingToken.contract_name, args.amount.__fixed__, stakingContractName)){
				txList.push({contract: config.ammContractName, method: "approve_liquidity"})
			}
		}else{
			if (await this.needsApproval(stakingToken.contract_name, args.amount.__fixed__, stakingContractName)){
				txList.push({contract: stakingToken.contract_name, method: "approve"})
			}
		}
		let totalStampsNeeded = await this.estimateTxCosts(txList)
		if (this.userHasSufficientStamps(totalStampsNeeded, callbacks)){
			let results;
			if (isLpToken){
				results = await this.callApprove_LP(stakingToken.contract_name, args.amount.__fixed__, stakingContractName)
			}else{
				results = await this.callApprove(stakingToken.contract_name, args.amount.__fixed__, stakingContractName)
			}
			if (results){
				this.sendTransaction(
					stakingContractName, 
					"addStakingTokens", 
					args, 
					callbacks, 
					(res) => this.handleStakeTokens(res, stakingToken, yieldToken, isLpToken, callbacks)
				)
			}else{
				if (callbacks) callbacks.error()
			}
		}
	}

	private handleStakeTokens = (res, stakingToken, yieldToken, isLpToken, callbacks = undefined) => {
		let status = this.txResult(res.data, callbacks)
		if (status === 'success') {
			this.toastService.addToast({ 
				icon: "gaugePlus",
				heading: `Tokens Staked!`,
				text: `You have staked ${stakingToken.token_symbol}${isLpToken ? " LP" : ""} and will start to accumulate ${yieldToken.token_symbol}.`, 
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

	public async removeStake(stakingContractName, args, stakingToken, yieldToken, callbacks = undefined) {
		let txList = [{contract: stakingContractName, method: "withdrawTokensAndYield"}]
		let totalStampsNeeded = await this.estimateTxCosts(txList)
		if (this.userHasSufficientStamps(totalStampsNeeded, callbacks)){
			this.sendTransaction(
				stakingContractName, 
				"withdrawTokensAndYield", 
				args, 
				callbacks, 
				(res) => this.handleRemoveStake(res, stakingToken, yieldToken, callbacks)
			)
		}
	}

	private handleRemoveStake = (res, stakingToken, yieldToken, callbacks = undefined) => {
		let status = this.txResult(res.data, callbacks)
		if (status === 'success') {
			this.toastService.addToast({ 
				icon: "gaugeMinus",
				heading: `Stake and Yield Removed!`,
				text: `You have removed your stake of ${stakingToken.token_symbol} and any earned ${yieldToken.token_symbol}.`, 
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

	public async withdrawStake(stakingContractName, args, stakingToken, yieldToken, callbacks = undefined) {
		let txList = [{contract: stakingContractName, method: "withdrawYield"}]
		let totalStampsNeeded = await this.estimateTxCosts(txList)
		if (this.userHasSufficientStamps(totalStampsNeeded, callbacks)){
			this.sendTransaction(
				stakingContractName, 
				"withdrawYield", 
				args, 
				callbacks, 
				(res) => this.handleWithdrawStake(res, stakingToken, yieldToken, args.amount.__fixed__, callbacks)
			)
		}
	}

	private handleWithdrawStake = (res, stakingToken, yieldToken, amount, callbacks = undefined) => {
		let status = this.txResult(res.data, callbacks)
		if (status === 'success') {
			this.toastService.addToast({ 
				icon: "buyToken",
				heading: `${yieldToken.token_symbol} Received!`,
				text: `You have withdrawn ${stringToFixed(amount, 8)} ${yieldToken.token_symbol} from the ${stakingToken.token_symbol}/${yieldToken.token_symbol} contract.`, 
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

	public async stakeTokensInAMM(contractName, args, newDiscount, addingMore, callbacks = undefined) {
		let txList = [{contract: contractName, method: "stake"}]
		if (await this.needsApproval(config.ammTokenContract, args.amount.__fixed__, config.ammContractName)){
			txList.push({contract: config.ammTokenContract, method: "approve"})
		}
		let totalStampsNeeded = await this.estimateTxCosts(txList)
		if (this.userHasSufficientStamps(totalStampsNeeded, callbacks)){
			let results = await this.callApprove(config.ammTokenContract, args.amount.__fixed__, config.ammContractName)
			if (results){
				this.sendTransaction(
					contractName, 
					"stake", 
					args, 
					callbacks, 
					(res) => this.handleStakeTokensInAMM(res, newDiscount, addingMore, callbacks)
				)
			}else{
				if (callbacks) callbacks.error()
			}
		}
	}

	private handleStakeTokensInAMM = (res, newDiscount, addingMore, callbacks = undefined) => {
		let status = this.txResult(res.data, callbacks)
		if (status === 'success') {
			this.toastService.addToast({ 
				icon: addingMore ? "gaugePlus" : "gaugeMinus",
				heading: `Fuel Tank Adjusted!`,
				text: `Your Rocketswap fees discount has been ${addingMore ? "increased" : "lowered"} to ${stringToFixed(newDiscount, 2)}%`, 
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

	public async compoundYield(singleAssetContractName, args, amount, stakingToken, yieldToken, callbacks = undefined) {
		let txList = [{contract: singleAssetContractName, method: "stakeFromContractProfits"}]
		if (await this.needsApproval(stakingToken.contract_name, amount, singleAssetContractName)){
			txList.push({contract: yieldToken.contract_name, method: "approve"})
		}
		let totalStampsNeeded = await this.estimateTxCosts(txList)
		if (this.userHasSufficientStamps(totalStampsNeeded, callbacks)){
			let results = await this.callApprove(yieldToken.contract_name, this.maxApprovalAmount, singleAssetContractName)
			if (results){
				this.sendTransaction(
					singleAssetContractName, 
					"stakeFromContractProfits", 
					args, 
					callbacks, 
					(res) => this.handleCompoundYield(res, yieldToken, callbacks),
					1000
				)
			}else{
				if (callbacks) callbacks.error()
			}
		}
	}

	public async compoundSelf(singleAssetContractName, args, yieldToken, callbacks = undefined) {
		let txList = [{contract: singleAssetContractName, method: "addStakingTokens"}]
		let totalStampsNeeded = await this.estimateTxCosts(txList)
		if (this.userHasSufficientStamps(totalStampsNeeded, callbacks)){
			this.sendTransaction(
				singleAssetContractName, 
				"addStakingTokens", 
				args, 
				callbacks, 
				(res) => this.handleCompoundYield(res, yieldToken, callbacks)
			)
		}
	}

	private handleCompoundYield = (res, yieldToken, callbacks = undefined) => {
		let status = this.txResult(res.data, callbacks)
		if (status === 'success') {
			this.toastService.addToast({ 
				icon: "gaugePlus",
				heading: `Tokens Staked!`,
				text: `You have staked ${yieldToken.token_symbol} and will start to accumulate more ${yieldToken.token_symbol}.`, 
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



	private handleTxErrors(errors, callbacks = undefined){
		if (Array.isArray(errors)){
			errors.forEach(error => {
				let toastType = 'info'
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
					heading: 'Transaction Error',
					type: toastType === 'info' ? 'info' : 'error',
					text: error
				})
			})
		}else{
			if (typeof errors === 'string'){
				this.toastService.addToast({
					heading: 'Transaction Error',
					type: 'error',
					text: errors
				})	
			}else{
				this.toastService.addToast({
					heading: 'Unknown Transaction Error',
					type: 'error',
					text: 'Something happened and we couldn\'t get the status of your transaction.'
				})
			}
		}
		if (callbacks) {
			callbacks.error(errors)
		}
	}

	private txResult(txResults, callbacks = undefined) {
		if (txResults.errors) {
			this.handleTxErrors(txResults.errors, callbacks)
			return txResults.errors
		}
		if (txResults?.txBlockResult?.errors?.length > 0) {
			let errors = txResults?.txBlockResult?.errors
			this.handleTxErrors(errors, callbacks)
			return errors
		}
		if (txResults.resultInfo.title === "Transaction Pending"){
			return 'pending'
		}
		if (typeof txResults.txBlockResult.status !== 'undefined') {
			if (txResults.txBlockResult.status === 0) {
				return 'success'
			}
			if (txResults.txBlockResult.status === 1) {
				this.handleTxErrors(txResults.txBlockResult.errors, callbacks)
				return txResults.txBlockResult.errors
			}
		}
	}

	public needsApproval = async (contract, amount, approvalTo = undefined) => {
		let approvedAmount = await this.getApprovedAmount(get(walletAddress), contract, approvalTo)

		return approvedAmount.isLessThan(amount)
	}

	public getApprovedAmount = async (vk, contract, approvalTo) => {
		let res =  await this.apiService.getBalanceValue(contract, vk, approvalTo || connectionRequest.contractName)
		return res
	}

	public needsApproval_LP = async (tokenContract, amount, approvalTo = undefined) => {
		let approvedAmount = await this.getApprovedAmount_LP(get(walletAddress), tokenContract, approvalTo)

		return approvedAmount.isLessThan(amount)
	}

	public getApprovedAmount_LP = async (vk, tokenContract, approvalTo) => {
		return await this.apiService.getLpApprovalValue(`${tokenContract}:${vk}:${approvalTo}`)
	}

	public async approveBN(contractName, approveAmount, approveTo, callback = undefined) {
		if (await this.needsApproval(contractName, approveAmount, approveTo)){
			let args = {
				amount: { __fixed__: this.maxApprovalAmount },
				to: approveTo || connectionRequest.contractName
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

	private callApprove (contract, amount, to = undefined) {
		return new Promise((resolve) => {
			this.approveBN(contract, amount, to, (res, err) => {
				if (err || !res) {
					this.handleTxErrors(["Unknown Error."])
					resolve(false)
				}else{
					if (res === true) resolve(true)
					else {
						if (res.status === "Transaction Cancelled") {
							this.handleTxErrors(res.data.errors)
							resolve(false)
							return
						}
						if (res?.data?.txBlockResult?.status === 0) resolve(true)
						else {
							if (res?.data?.resultInfo?.returnResult){
								this.handleTxErrors([res?.data?.resultInfo?.returnResult])
							}else{
								this.handleTxErrors(res.data.resultInfo.errorInfo)
							}
							resolve(false)
						}
					}
				}
			})
		})
	}

	public async approveBN_LP(contractName, approveAmount, approveTo, callback = undefined) {
		if (await this.needsApproval_LP(contractName, approveAmount, approveTo)){
			let args = {
				amount: { __fixed__: this.maxApprovalAmount },
				to: approveTo,
				contract: contractName
			}
			this.sendTransaction(
				config.ammContractName, 
				"approve_liquidity", 
				args, 
				null, 
				callback
			)
		} else {
			if (callback) callback(true)
		}
	}

	private callApprove_LP (contract, amount, to) {
		return new Promise((resolve) => {
			this.approveBN_LP(contract, amount, to, (res, err) => {
				if (err || !res) {
					this.handleTxErrors(["Unknown Error."])
					resolve(false)
				}else{
					if (res === true) resolve(true)
					else {
						if (res.status === "Transaction Cancelled") {
							this.handleTxErrors(res.data.errors)
							resolve(false)
							return
						}
						if (res?.data?.txBlockResult?.status === 0) resolve(true)
						else {
							if (res?.data?.resultInfo?.returnResult){
								this.handleTxErrors([res?.data?.resultInfo?.returnResult])
							}else{
								this.handleTxErrors(res.data.resultInfo.errorInfo)
							}
							resolve(false)
						}
					}
				}
			})
		})
	}

	private insufficientCurrencyForTransactionToast = (stampCost) => {
		let currencyAmount = stringToFixed(get(walletBalance), 8)
		let stampCostString = stringToFixed(stampsToTAU(stampCost), 8)
		this.toastService.addToast({
			heading: `Insufficient ${config.currencySymbol}`,
			text: `It costs ${stampCostString} ${config.currencySymbol} to send this transaction and you only have ${currencyAmount} ${config.currencySymbol} in your wallet.`,
			type: 'info',
			duration: 5000
		})
	}
}
