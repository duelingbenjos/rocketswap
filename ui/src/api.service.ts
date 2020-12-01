import axios from 'axios'
import { token_list_store } from './store'

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
    const res = await axios.get('http://localhost:3001/api/token_list')
    token_list_store.set(res.data)
    return res.data
  } catch (err) {
    console.error(err)
    throw err
  }
}
