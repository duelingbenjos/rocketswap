import socket from 'socket.io-client'
import { token_metrics_store } from '../store'
import type { PriceUpdateType, TokenMetricsType } from '../types/api.types'
import { getBaseUrl } from '../utils'

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
    this.port = 3001
    // console.log(socket)
    this.connection = socket(`${this.base_url}:${this.port}`)
    console.log(this.connection)
    this.setupEvents()
    this.setupSubs()
  }

  setupEvents = () => {
    console.log('setup events')
    this.connection.on('connect', () => {
      console.log(`socket connected to : ${this.base_url}:${this.port}`)
      this.connection.on('joined_room', (msg) => {
        console.log('joined room : ', msg)
      })
      this.connection.on('left_room', (msg) => {
        console.log('left room : ', msg)
      })
    })
  }

  setupSubs = () => {
    token_metrics_store.subscribe((metrics) => {
      this.token_metrics = metrics
    })
  }

  public joinPriceFeed(contract_name: string) {
    console.log('joined room')
    this.connection.emit('join_room', `price_feed:${contract_name}`)
    this.connection.on(`price_feed:${contract_name}`, this.handlePriceUpdate)
  }

  public leavePriceFeed(contract_name: string) {
    this.connection.emit('leave_room', `price_feed:${contract_name}`)
    this.connection.off(`price_feed:${contract_name}`)
  }

  private handlePriceUpdate = (price_update: PriceUpdateType) => {
    console.log('price feed : ', price_update)
    let { contract_name } = price_update
    const metrics = this.token_metrics
    metrics[contract_name] = { ...metrics[contract_name], ...price_update }
    token_metrics_store.set(metrics)
    console.log('token_metrics', metrics)
  }
}
