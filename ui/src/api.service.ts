import axios from 'axios'
import { token_list_store } from './store'

export class ApiService {
  public static getInstance() {
    if (!ApiService.instance) ApiService.instance = new ApiService()
    return ApiService.instance
  }
  private static instance: ApiService
  constructor() {
    this.getTokenList()
  }

  private getTokenList() {
    setInterval(async () => {
      try {
        const token_list = await getTokenList()
        console.log(token_list)
        token_list_store.set(token_list)
      } catch (err) {
        console.log(err)
      }
    },10000)
  }
}

export async function getTokenList() {
  try {
    const res = await axios.get('http://localhost:3001/api/token_list')
    return res.data
  } catch (err) {
    console.error(err)
    throw err
  }
}
