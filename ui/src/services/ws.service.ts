import socket from 'socket.io-client'
import { token_metrics_store, tokenBalances, ws_id } from '../store'
import type { MetricsUpdateType, TokenMetricsType } from '../types/api.types'
import { getBaseUrl, valuesToBigNumber } from '../utils'

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

  connection: SocketIOClient.Socket

  constructor() {
    console.log('WS Service STARTED')
    this.base_url = getBaseUrl(document.location.href)
    this.port = 3002
    this.connection = socket(`${this.base_url}:${this.port}`)
    this.setupEvents()
    this.setupSubs()
    this.joinTrollBox()
  }

  setupEvents = () => {
    // console.log('setup events')
    this.connection.on('connect', () => {
      console.log(`socket connected to : ${this.base_url}:${this.port}`)
      this.connection.on('trade_update', (msg) => {
        // console.log(msg)
      })
      this.connection.on('trollbox_message', (msg) => {
        console.log(msg)
      })
      this.connection.on('joined_room', (msg) => {
        // console.log('joined room : ', msg)
      })
      this.connection.on('left_room', (msg) => {
        // console.log('left room : ', msg)
      })
      this.connection.on('auth_response', (msg) => {
        console.log(msg)
      })
    })
  }

  setupSubs = () => {
    token_metrics_store.subscribe((metrics) => {
      this.token_metrics = metrics
    })
  }

  public joinTradeFeed(contract_name: string) {
    this.leaveTradeFeed()
    this.connection.on(`trade_update:${contract_name}`, this.handleTradeUpdate)
    this.current_trade_feed = contract_name
    console.log('joined trade feed : ', contract_name)
  }

  public leaveTradeFeed() {
    const contract_name = this.current_trade_feed
    this.connection.off(`trade_update:${contract_name}`)
    this.current_trade_feed = ''
    console.log('left trade feed : ', contract_name)
  }

  private handleTradeUpdate(event) {
    console.log(event)
  }

  public joinBalanceFeed(vk: string) {
    this.connection.emit('join_room', `balance_feed:${vk}`)
    this.connection.on(`balance_list:${vk}`, this.handleBalanceList)
    this.connection.on(`balance_update:${vk}`, this.handleBalanceUpdate)
  }

  public joinTrollBox() {
    this.connection.emit('join_room', `trollbox`)
    this.connection.on(`trollbox_authcode`, this.handleTrollboxAuthCode)
  }

  private handleTrollboxAuthCode(payload) {
    console.log(payload)
    ws_id.set(payload)
  }

  private handleBalanceList(payload) {
    console.log(payload)
    tokenBalances.set(valuesToBigNumber(payload).balances)
  }

  private handleBalanceUpdate(data) {
    const { payload } = data
    tokenBalances.set(valuesToBigNumber(payload).balances)
  }

  public joinPriceFeed(contract_name: string) {
    console.log('join price feed')
    this.connection.emit('join_room', `price_feed:${contract_name}`)
    this.connection.on(`price_feed:${contract_name}`, this.handleMetricsUpdate)
  }

  public leavePriceFeed(contract_name: string) {
    console.log('leave price feed')
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

  private handlePriceFeedUpdate(update) {
    console.log(update)
  }
}
