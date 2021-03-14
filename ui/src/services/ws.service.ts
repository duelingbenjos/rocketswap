	import socket from 'socket.io-client'
	import { 
	token_metrics_store, 
	tokenBalances, 
	ws_id, 
	trollboxMessages, 
	tradeUpdates, 
	tradeHistory, 
	stakingInfo, 
	userYieldInfo,
	epochs } from '../store'
	import type { MetricsUpdateType, TokenMetricsType } from '../types/api.types'
	import { getBaseUrl, valuesToBigNumber, setBearerToken } from '../utils'
	import { config } from '../config'

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
		this.base_url = getBaseUrl(document.location.href)
		this.port = 3002
		this.connection = socket(`${this.base_url}:${this.port}`)
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
			this.joinPriceFeed(config.ammTokenContract)
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
						message: item.message
					}
				}))
			return val
		})
		this.connection.off(`trollbox_history`)
	}

	private handleTrollBoxMessage(msg){
		trollboxMessages.update((val) => {
			val.push({ sender: msg.sender.name, message: msg.message })
			return val
		})
	}

	// AUTH 
	private handleAuthResponse(msg){
		console.log({handleAuthResponse:msg})
		localStorage.setItem('auth_token', JSON.stringify(msg))
		setBearerToken()
	}

/* -------------------------
		CONTRACT FEEDS
*/
	public joinPriceFeed(contract_name: string) {
		if(this.joinedFeeds[`price_feed:${contract_name}`]) return
		//console.log('join price feed')
		this.connection.emit('join_room', `price_feed:${contract_name}`)
		this.connection.on(`price_feed:${contract_name}`, this.handleMetricsUpdate)

		this.joinedFeeds[`price_feed:${contract_name}`] = true
	}

	private handleMetricsUpdate = (metrics_update: MetricsUpdateType) => {
		let { contract_name } = metrics_update
		const metrics = this.token_metrics
		metrics[contract_name] = { ...metrics[contract_name], ...metrics_update }
		token_metrics_store.set(valuesToBigNumber(metrics))
	}

	public leavePriceFeed(contract_name: string) {
		//console.log('leave price feed')
		this.connection.emit('leave_room', `price_feed:${contract_name}`)
		this.connection.off(`price_feed:${contract_name}`)

		this.joinedFeeds[`price_feed:${contract_name}`] = false
	}

	public joinTradeFeed(contract_name: string) {
		if (this.current_trade_feed === contract_name) return
		//this.leaveTradeFeed()
		this.connection.on(`trade_update:${contract_name}`, this.handleTradeUpdate)
		this.connection.emit('join_room', `trade_feed:${contract_name}`)
		this.current_trade_feed = contract_name

		this.joinedFeeds[`trade_feed:${contract_name}`] = true
		//console.log('joined trade feed : ', contract_name)
	}

	private handleTradeUpdate(event) {
		console.log({trade_feed: event})
		//console.log(event)
		if (event.history) tradeHistory.set(valuesToBigNumber(event.history))
		else {
		if (event.action === 'trade_update') {
			tradeUpdates.update((trades) => {
			trades.push(valuesToBigNumber(event))
			//console.log(trades)
			return trades
			})
		}
		}
	}

	public leaveTradeFeed() {
		const contract_name = this.current_trade_feed
		this.connection.off(`trade_update:${contract_name}`)
		
		this.current_trade_feed = ''
		//console.log('left trade feed : ', contract_name)
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
		console.log({user_yield_list: payload})
		userYieldInfo.set(valuesToBigNumber(payload))
	}

	private handleUserYieldFeedUpdate(update){
		console.log({user_yield_update: update})
		userYieldInfo.update(currentValue => {
			Object.keys(update).map(val => {
				if(currentValue[val]) currentValue[val] = valuesToBigNumber(update[val])
			})
			console.log(currentValue)
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
		//console.log(payload)
		tokenBalances.set(valuesToBigNumber(payload).balances)
	}

	private handleBalanceUpdate(data) {
		//console.log(data)
		const { payload } = data
		tokenBalances.set(valuesToBigNumber(payload).balances)
	}

	public leaveBalanceFeed(vk: string) {
		this.connection.off(`balance_list:${vk}`)
		this.connection.off(`balance_update:${vk}`)
		tokenBalances.set({})

		this.joinedFeeds[`balance_feed:${vk}`] = false
	}
}
