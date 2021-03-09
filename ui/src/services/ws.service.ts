import socket from 'socket.io-client'
import { token_metrics_store, tokenBalances, ws_id, trollboxMessages, tradeUpdates, tradeHistory, stakingInfo } from '../store'
import type { MetricsUpdateType, TokenMetricsType } from '../types/api.types'
import { getBaseUrl, valuesToBigNumber, setBearerToken } from '../utils'
import * as LamdenJs from 'lamden-js'
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

  connection: SocketIOClient.Socket

  constructor() {
    //console.log('WS Service STARTED')
    this.base_url = getBaseUrl(document.location.href)
    this.port = 3002
    this.connection = socket(`${this.base_url}:${this.port}`)
    this.setupEvents()
    this.setupSubs()
    this.txCallbacks = {}
  }

  setupEvents = () => {
    this.connection.on('connect', () => {
      //console.log(`socket connected to : ${this.base_url}:${this.port}`)
      if (!this.previously_connected) {
        this.connection.emit('join_room', `trollbox`)
        this.previously_connected = true
        this.joinPriceFeed(config.ammTokenContract)
      }
    })
    this.connection.on('trollbox_message', (msg) => {
      trollboxMessages.update((val) => {
        val.push({ sender: msg.sender.name, message: msg.message })
        return val
      })
      //console.log(msg)
    })
    this.connection.on(`trollbox_history`, (history) => {
      trollboxMessages.update((val) => {
        val.push(
          ...history.map((item) => {
            return {
              sender: item.sender.name,
              message: item.message
            }
          })
        )
        return val
      })
      this.connection.off(`trollbox_history`)
    })
    this.connection.on('auth_response', (msg) => {
      //console.log("BEARER TOKEN!")
      //console.log(msg)
      localStorage.setItem('auth_token', JSON.stringify(msg))
      setBearerToken()
    })
    this.connection.on(`trollbox_authcode`, this.handleTrollboxAuthCode)
    this.connection.on('proxy_txn_res', (payload) => this.handleProxyTxnResponse(payload, this.txCallbacks))
  }

  setupSubs = () => {
    token_metrics_store.subscribe((metrics) => {
      this.token_metrics = metrics
    })
  }

  public joinTradeFeed(contract_name: string) {
    if (this.current_trade_feed === contract_name) return
    this.leaveTradeFeed()
    this.connection.on(`trade_update:${contract_name}`, this.handleTradeUpdate)
    this.connection.emit('join_room', `trade_feed:${contract_name}`)
    this.current_trade_feed = contract_name
    //console.log('joined trade feed : ', contract_name)
  }

  public leaveTradeFeed() {
    const contract_name = this.current_trade_feed
    this.connection.off(`trade_update:${contract_name}`)
    this.current_trade_feed = ''
    //console.log('left trade feed : ', contract_name)
    tradeHistory.set([])
    tradeUpdates.set([])
  }

  private handleTradeUpdate(event) {
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
  
  public joinStakingPanel() {
    this.connection.emit('join_room', 'staking_panel')

    /*
    This payload is an array containing all the registered staking pools in the API
    */
    this.connection.on(`staking_panel`, (payload) => {
      console.log(payload)
      stakingInfo.set(valuesToBigNumber(payload))
      console.log(valuesToBigNumber(payload))
    })

    /*
    Changes which effect individual staking contracts will be emitted on the event 'staking_panel_update'
    Type : StakingMetaEntity
    */
    this.connection.on('staking_panel_update', (payload) => {
      console.log(payload)
    })

    /*
    Epoch Data
    */
    this.connection.on(`epoch_data`, (payload) => {
      console.log(payload)
    })

    this.connection.on(`epoch_update`, (payload) => {
      console.log(payload)
    })
  }

  public leaveStakingPanel() {
    this.connection.emit('leave_room', 'staking_panel')
    this.connection.off(`staking_panel`)
    this.connection.off(`staking_panel_update`)
  }

  public joinBalanceFeed(vk: string) {
    this.connection.emit('join_room', `balance_feed:${vk}`)
    this.connection.on(`balance_list:${vk}`, this.handleBalanceList)
    this.connection.on(`balance_update:${vk}`, this.handleBalanceUpdate)
  }

  public joinUserStakingFeed(vk: string) {
    this.connection.emit('join_room', `user_staking_feed:${vk}`)
    this.connection.on(`user_staking_update:${vk}`, (data) => console.log(data))
  }

  public leaveUserStakingFeed(vk: string) {
    this.connection.off(`user_staking_update:${vk}`)
  }

  public leaveBalanceFeed(vk: string) {
    this.connection.off(`balance_list:${vk}`)
    this.connection.off(`balance_update:${vk}`)
    tokenBalances.set({})
  }

  private handleTrollboxAuthCode(payload) {
    //console.log("AUTH_CODE!")
    //console.log(payload)
    ws_id.set(payload)
  }

  private handleProxyTxnResponse(payload, txCallbacks) {
    if (payload?.uid) txCallbacks[payload.uid]({ data: payload })
    else {
      if (payload?.error) txCallbacks[payload.uid]({ data: { error: payload?.error } })
    }
  }

  public sendProxyTxn(tx, callback) {
    //console.log(this.txCallbacks)
    this.txCallbacks[tx.payload.uid] = callback
    //console.log(this.txCallbacks)
    this.connection.emit('send_transaction', tx)
  }

  private handleTrollboxHistory(payload: any[]) {}

  private handleBalanceList(payload) {
    //console.log(payload)
    tokenBalances.set(valuesToBigNumber(payload).balances)
  }

  private handleBalanceUpdate(data) {
    //console.log(data)
    const { payload } = data
    tokenBalances.set(valuesToBigNumber(payload).balances)
  }

  public joinPriceFeed(contract_name: string) {
    //console.log('join price feed')
    this.connection.emit('join_room', `price_feed:${contract_name}`)
    this.connection.on(`price_feed:${contract_name}`, this.handleMetricsUpdate)
  }

  public leavePriceFeed(contract_name: string) {
    //console.log('leave price feed')
    this.connection.emit('leave_room', `price_feed:${contract_name}`)
    this.connection.off(`price_feed:${contract_name}`)
  }

  private handleMetricsUpdate = (metrics_update: MetricsUpdateType) => {
    let { contract_name } = metrics_update
    const metrics = this.token_metrics
    console.log(metrics_update)
    metrics[contract_name] = { ...metrics[contract_name], ...metrics_update }
    token_metrics_store.set(valuesToBigNumber(metrics))
  }
}
