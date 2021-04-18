	import socket from 'socket.io-client'
	import { get } from 'svelte/store'
	import { 
		token_metrics_store, 
		tokenBalances, 
		ws_id, 
		trollboxMessages, 
		tradeUpdates, 
		tradeHistory, 
		stakingInfo, 
		userYieldInfo,
		epochs,
		lpBalances,
		lpPairs,
		tauUSDPrice } from '../store'
	import type { MetricsUpdateType, TokenMetricsType } from '../types/api.types'
	import { valuesToBigNumber, setBearerToken, toBigNumber, toBigNumberPrecision } from '../utils'
	import { config, getBaseUrl } from '../config'

	/** Singleton socket.io service */
	export class WsService {
	private static _instance: WsService
	public static getInstance() {
		if (!this._instance) {
		WsService._instance = new WsService()
		}
		return WsService._instance
	}

	private token_metrics: TokenMetricsType = {}
	private base_url: string
	private port: number
	private current_trade_feed: string
	private previously_connected = false
	private txCallbacks: any
	private joinedFeeds: any

	connection: SocketIOClient.Socket

	constructor() {
		//console.log('WS Service STARTED')
		this.base_url = getBaseUrl()
		this.connection = socket.connect(this.base_url)
		this.setupEvents()
		this.setupSubs()
		this.txCallbacks = {}
		this.joinedFeeds = {}
	}

	setupEvents = () => {
		this.connection.on('connect', this.handleConnect.bind(this))
		this.connection.on('trollbox_message', this.handleTrollBoxMessage.bind(this))
		this.connection.on(`trollbox_history`, this.handleTrollboxHistory.bind(this))
		this.connection.on('auth_response', this.handleAuthResponse.bind(this))
		this.connection.on(`trollbox_authcode`, this.handleTrollboxAuthCode.bind(this))
		this.connection.on('proxy_txn_res', (payload) => this.handleProxyTxnResponse(payload, this.txCallbacks))
	}

	setupSubs = () => {
		token_metrics_store.subscribe((metrics) => {
			this.token_metrics = metrics
		})

	}

/* -------------------------
		MAIN FEEDS
*/ 
	// CONNECT
	private handleConnect(){
		//console.log(`socket connected to : ${this.base_url}:${this.port}`)
		if (!this.previously_connected) {
			this.connection.emit('join_room', `trollbox`)
			this.previously_connected = true
			this.joinTokenMetricsFeed(config.ammTokenContract)
			this.joinTauUsdFeed()
		}
	}
	// TRANSACTIONS
	public sendProxyTxn(tx, callback) {
		this.txCallbacks[tx.payload.uid] = callback
		this.connection.emit('send_transaction', tx)
	}

	private handleProxyTxnResponse(payload, txCallbacks) {
		if (payload?.uid) txCallbacks[payload.uid]({ data: payload })
		else {
		if (payload?.error) txCallbacks[payload.uid]({ data: { error: payload?.error } })
		}
	}

	// STAKING
	public joinStakingPanel() {
		if (this.joinedFeeds['staking_panel']) return
		this.connection.emit('join_room', 'staking_panel')

		/*
		This payload is an array containing all the registered staking pools in the API
		*/
		this.connection.on(`staking_panel`, (payload) => {
			console.log(JSON.parse(JSON.stringify(payload)))
			stakingInfo.set(valuesToBigNumber(payload))
			console.log({staking_panel: payload})
		})

		/*
		Changes which effect individual staking contracts will be emitted on the event 'staking_panel_update'
		Type : StakingMetaEntity
		*/
		this.connection.on('staking_panel_update', (payload) => {
			console.log({staking_update: payload})
			stakingInfo.update(currentValue => {
				currentValue.forEach((info, index) => {
				if (info.contract_name === payload.data.contract_name) currentValue[index] = payload.data
				})
				return currentValue
			})
		})

		this.connection.on(`epoch_data`, (payload) => {
			epochs.set(valuesToBigNumber(payload))
			console.log({epoch_data: payload})
		})

		this.connection.on(`epoch_update`, (payload) => {
			console.log({epoch_update: payload})
		})

		this.joinedFeeds['staking_panel'] = true
	}

	public leaveStakingPanel() {
		this.connection.emit('leave_room', 'staking_panel')
		this.connection.off(`staking_panel`)
		this.connection.off(`staking_panel_update`)

		this.joinedFeeds['staking_panel'] = false
	}

	// TROLL BOX
	private handleTrollboxAuthCode(payload) {
		ws_id.set(payload)
	}

	private handleTrollboxHistory(history){
		trollboxMessages.update((val) => {
			val.push(
				...history.map((item) => {
					return {
						sender: item.sender.name,
						message: item.message,
						timestamp: item.timestamp
					}
				}))
			return val
		})
		this.connection.off(`trollbox_history`)
	}

	private handleTrollBoxMessage(msg){
		trollboxMessages.update((val) => {
			val.push({ sender: msg.sender.name, message: msg.message, timestamp: msg.timestamp })
			return val
		})
	}

	// AUTH 
	private handleAuthResponse(msg){
		console.log({handleAuthResponse:msg})
		localStorage.setItem('auth_token', JSON.stringify(msg))
		setBearerToken()
	}

	// TAU USD FEED
	public joinTauUsdFeed() {
		if (this.joinedFeeds[`tau_usd_price`]) return
		
		this.connection.emit('join_room', `tau_usd_price`)
		this.connection.on(`tau_usd_price`, this.handleTauUsdFeed)

		this.joinedFeeds[`tau_usd_price`] = true
	}

	private handleTauUsdFeed(msg){
		console.log({handleTauUsdFeed: msg})
		if (msg.current_price){
			localStorage.setItem('tau_usd_price', JSON.stringify(msg.current_price))
			tauUSDPrice.set(toBigNumber(msg.current_price))
		}
		if (msg.price){
			localStorage.setItem('tau_usd_price_UPDATE', JSON.stringify(msg.price))
			tauUSDPrice.set(toBigNumber(msg.price))
		}

	}

/* -------------------------
		CONTRACT FEEDS
*/
	public joinTokenMetricsFeed(contract_name: string) {
		if(this.joinedFeeds[`price_feed:${contract_name}`]) return
		
		console.log({joinTokenMetricsFeed: contract_name})
		this.connection.emit('join_room', `price_feed:${contract_name}`)
		this.connection.on(`price_feed:${contract_name}`, this.handleTokenMetricsFeed)

		this.joinedFeeds[`price_feed:${contract_name}`] = true
	}

	private handleTokenMetricsFeed = (metrics_update: MetricsUpdateType) => {
		console.log({handleTokenMetricsFeed: JSON.parse(JSON.stringify(metrics_update))})
		let { contract_name } = metrics_update
		const metrics = this.token_metrics
		metrics[contract_name] = { ...metrics[contract_name], ...metrics_update }
		token_metrics_store.set(valuesToBigNumber(metrics))
	}

	public leavePriceFeed(contract_name: string) {
		this.connection.emit('leave_room', `price_feed:${contract_name}`)
		this.connection.off(`price_feed:${contract_name}`)

		this.joinedFeeds[`price_feed:${contract_name}`] = false
	}

	public joinTradeFeed(contract_name: string) {
		if (this.current_trade_feed === contract_name) return

		this.connection.on(`trade_update:${contract_name}`, (event) => this.handleTradeUpdate(event, contract_name))
		this.connection.emit('join_room', `trade_feed:${contract_name}`)
		this.current_trade_feed = contract_name

		this.joinedFeeds[`trade_feed:${contract_name}`] = true
	}

	private handleTradeUpdate(event, contract_name) {
		if (event.history) {
			tradeHistory.update( current => {
				if (!current[contract_name]) current[contract_name] = []
				let tradeList = valuesToBigNumber(event.history)
				current[contract_name] = tradeList.filter(trade => !trade.price.isEqualTo(0))
				return current
			})
		}
		else {
			if (event.action === 'trade_update') {
				tradeUpdates.update((current) => {
					if (!current[contract_name]) current[contract_name] = []
					let trade = valuesToBigNumber(event)
					if (!trade.price.isEqualTo(0)) current[contract_name].push(trade)
					return current
				})
			}
		}
	}

	public leaveTradeFeed() {
		const contract_name = this.current_trade_feed
		this.connection.off(`trade_update:${contract_name}`)
		this.current_trade_feed = ''

		tradeHistory.set([])
		tradeUpdates.set([])

		this.joinedFeeds[`trade_feed:${contract_name}`] = false
	}

/* -------------------------
	USER FEEDS
*/
	// YEILD STAKING
	public joinUserYieldFeed(vk: string) {
		this.connection.emit('join_room', `user_yield_feed:${vk}`)
		this.connection.on(`user_yield_list`, this.handleUserYieldFeed)
		this.connection.on(`user_yield_update:${vk}`, this.handleUserYieldFeedUpdate)
	}

	private handleUserYieldFeed(payload) {
		console.log(JSON.parse(JSON.stringify({user_yield_list: payload})))
		userYieldInfo.set(valuesToBigNumber(payload))
	}

	private handleUserYieldFeedUpdate(update){
		console.log({user_yield_update: update})
		userYieldInfo.update(currentValue => {
			Object.keys(update).map(val => {
				if(currentValue[val]) currentValue[val] = valuesToBigNumber(update[val])
			})
			return currentValue
		})
	}

	public leaveUserYieldFeed(vk: string) {
		this.connection.off(`user_yield_list:${vk}`)
		this.connection.off(`user_yield_update:${vk}`)
	}

	// TOKEN BALANCES
	public joinBalanceFeed(vk: string) {
		if (this.joinedFeeds[`balance_list:${vk}`]) return
		
		this.connection.emit('join_room', `balance_feed:${vk}`)
		this.connection.on(`balance_list:${vk}`, this.handleBalanceList)
		this.connection.on(`balance_update:${vk}`, this.handleBalanceUpdate)

		this.joinedFeeds[`balance_feed:${vk}`] = true
	}

	private handleBalanceList(payload) {
		console.log({handleBalanceList: JSON.parse(JSON.stringify(payload))})
		tokenBalances.set(valuesToBigNumber(payload).balances)
	}

	private handleBalanceUpdate(data) {
		console.log({handleBalanceUpdate: data})
		const { payload } = data
		tokenBalances.set(valuesToBigNumber(payload).balances)
	}

	public leaveBalanceFeed(vk: string) {
		this.connection.off(`balance_list:${vk}`)
		this.connection.off(`balance_update:${vk}`)
		tokenBalances.set({})

		this.joinedFeeds[`balance_feed:${vk}`] = false
	}

	public joinUserLpBalancesFeed(vk: string){
		if (this.joinedFeeds[`user_lp_feed:${vk}`]) return
		console.log({joinUserLpBalancesFeed: vk})
		this.connection.emit('join_room', `user_lp_feed:${vk}`)
		this.connection.on(`user_lp_feed:${vk}`, this.handleUserLpBalanceList)
		this.connection.on(`user_lp_update:${vk}`, this.handleUserLpBalanceUpdate)

		this.joinedFeeds[`user_lp_feed:${vk}`] = true
	}

	private handleUserLpBalanceList(payload){
		console.log({handleUserLpBalanceList: JSON.parse(JSON.stringify(payload))})
		lpBalances.set(valuesToBigNumber(payload).points)
		get(lpPairs)
	}

	private handleUserLpBalanceUpdate(data){
		console.log({handleUserLpBalanceUpdate: JSON.parse(JSON.stringify(data))})
		lpBalances.set(valuesToBigNumber(data).points)
	}

	public leaveUserLpBalanceFeed(vk: string){
		this.connection.off(`user_lp_feed:${vk}`)
		this.connection.off(`user_lp_update:${vk}`)
		lpBalances.set({})
		this.joinedFeeds[`user_lp_feed:${vk}`] = false
	}
}
