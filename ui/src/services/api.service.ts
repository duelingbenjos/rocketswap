import axios from 'axios'
import { token_list_store, wallet_store } from '../store'
import { getBaseUrl } from '../utils'
import { config } from '../config'

/** Singleton Api Service */
export class ApiService {
  public static getInstance() {
    if (!ApiService.instance) ApiService.instance = new ApiService()
    return ApiService.instance
  }
  private static instance: ApiService
  private base_url = getBaseUrl(document.location.href)
  constructor() {
    this.startTimer()
    this.getMarketList()
  }

  private startTimer() {
    setInterval(async () => {
      await this.getMarketList()
    }, 1000)
  }

  async getTokenList() {
    try {
      const token_list = await axios.get(`${this.base_url}:3001/api/token_list`)
      token_list_store.set(token_list.data)
      return token_list.data
    } catch (err) {
      console.error(err)
      throw err
    }
  }

  async getMarketList() {
    try {
      const token_list = await axios.get(`${this.base_url}:3001/api/market_list`)
      token_list_store.set(token_list.data)
      return token_list.data
    } catch (err) {
      console.error(err)
      throw err
    }
  }

  async getTokenBalances(vk: string) {
    try {
      const res = await axios.get(`${this.base_url}:3001/api/balances/${vk}`)
      return res.data
    } catch (err) {
      console.error(err)
    }
  }
}
