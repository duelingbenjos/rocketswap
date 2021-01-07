import socket from 'socket.io-client'
import { token_metrics_store, tokenBalances } from '../store'
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
  connection

  constructor() {
    console.log('WS Service STARTED')
    this.base_url = getBaseUrl(document.location.href)
    this.port = 3002
    this.connection = socket(`${this.base_url}:${this.port}`)
    this.setupEvents()
    this.setupSubs()
  }

  setupEvents = () => {
    // console.log('setup events')
    this.connection.on('connect', () => {
      console.log(`socket connected to : ${this.base_url}:${this.port}`)
      this.connection.on('joined_room', (msg) => {
        // console.log('joined room : ', msg)
      })
      this.connection.on('left_room', (msg) => {
        // console.log('left room : ', msg)
      })
    })
  }

  setupSubs = () => {
    token_metrics_store.subscribe((metrics) => {
      this.token_metrics = metrics
    })
  }

  public joinBalanceFeed(vk: string) {
    this.connection.emit('join_room', `balance_feed:${vk}`)
    this.connection.on(`balance_list:${vk}`, this.handleBalanceList)
    this.connection.on(`balance_update:${vk}`, this.handleBalanceUpdate)
  }

  private handleBalanceList(payload) {
    console.log('balance update received', payload)
    tokenBalances.set(valuesToBigNumber(payload).balances)
    
  }

  private handleBalanceUpdate(data) {
    const { payload } = data
    console.log('balance update received', payload)
    tokenBalances.set(valuesToBigNumber(payload).balances)
  }

  public joinPriceFeed(contract_name: string) {
    // console.log(Date.now(), 'joined room')
    this.connection.emit('join_room', `price_feed:${contract_name}`)
    this.connection.on(`price_feed:${contract_name}`, this.handleMetricsUpdate)
  }

  public leavePriceFeed(contract_name: string) {
    this.connection.emit('leave_room', `price_feed:${contract_name}`)
    this.connection.off(`price_feed:${contract_name}`)
  }

  private handleMetricsUpdate = (metrics_update: MetricsUpdateType) => {
    // console.log('metrics feed : ', metrics_update)
    let { contract_name } = metrics_update
    const metrics = this.token_metrics
    metrics[contract_name] = { ...metrics[contract_name], ...metrics_update }
    console.log(metrics)
    token_metrics_store.set(valuesToBigNumber(metrics))
    // console.log('token_metrics', metrics)
  }

  private handlePriceFeedUpdate(update) {
    console.log(update)
  }
}
