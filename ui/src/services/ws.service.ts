import socket from 'socket.io-client'
import { getBaseUrl } from '../utils'
export class WsService {
  private static _instance: WsService
  public static getInstance() {
    if (!this._instance) {
      WsService._instance = new WsService()
    }
  }

  private base_url = getBaseUrl(document.location.href)
  connection: SocketIOClient.Socket = socket(`${this.base_url}:3000`)
  constructor() {
    this.setupEvents()
  }

  setupEvents = () => {
    this.connection.on('connect', () => {
      this.connection.on('joined_room', (msg) => {
        console.log('Joined Room', msg)
      })
    })
  }

  public joinPriceFeed(contract_name: string) {
    this.connection.emit('join_room', `price_feed:${contract_name}`)
    this.connection.on(`price_feed:${contract_name}`, this.handlePriceUpdate)
  }

  public leavePriceFeed(contract_name: string) {
    this.connection.emit('join_room', `price_feed:${contract_name}`)
    this.connection.off(`price_feed:${contract_name}`)
  }

  private handlePriceUpdate(price_update: PriceUpdateType) {
    console.log(price_update)
  }
}

export type PriceUpdateType = {
  action: 'price_update'
  contract_name: string
  price: number
  time: number
}
