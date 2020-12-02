import axios from 'axios'
import { token_list_store, wallet_store } from './store'

export class ApiService {
  public static getInstance() {
    if (!ApiService.instance) ApiService.instance = new ApiService()
    return ApiService.instance
  }
  private static instance: ApiService
  constructor() {
    this.startTimer()
    getTokenList()
  }

  private startTimer() {
    setInterval(async () => {
      await getTokenList()
    }, 1000)
  }
}

export async function getTokenList() {
  try {
    const token_list = await axios.get('http://localhost:3001/api/token_list')
    token_list_store.set(token_list.data)
    return token_list.data
  } catch (err) {
    console.error(err)
    throw err
  }
}

export async function getTokenBalances(vk: string) {
  try {
    const res = await axios.get(`http://localhost:3001/api/balances/${vk}'`)
    return res.data.balances
  } catch (err) {
    console.error(err)
  }
}
