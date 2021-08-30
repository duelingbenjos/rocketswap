import axios from 'axios'
import { token_list_store, bearerToken } from '../store'
import { valuesToBigNumber, removeLSValue } from '../utils'
import { get } from 'svelte/store'
import { config, getBaseUrl } from '../config'

/** Singleton Api Service */
export class ApiService {
	public static getInstance() {
		if (!ApiService.instance) ApiService.instance = new ApiService()
		return ApiService.instance
	}
	private static instance: ApiService
	private base_url = getBaseUrl()
	private token_info_cache = {}

	async getVerifiedTokensList() {
		try {
			return await axios.get(`${this.base_url}/api/verified_tokens`).then((res) => res.data)
		} catch (err) {
			console.error(err)
			throw err
		}
	}

	async getTokenList(filter = []) {
		try {
			let token_list = await axios.get(`${this.base_url}/api/token_list`).then((res) => valuesToBigNumber(res.data))
		if (filter.includes('no-market')) token_list = token_list.filter((token) => !token.has_market)
			token_list_store.set(token_list)
			return token_list
		} catch (err) {
			console.error(err)
			throw err
		}
	}

	async get_market_summaries(){
		try {
			let summary = await axios.get(`${this.base_url}/api/get_market_summaries_w_token`).then((res) => valuesToBigNumber(res.data))
			return summary
		} catch (err) {
			console.error(err)
			throw err
		}
	}

	async getMarketList() {
		try {
			let token_list = await axios.get(`${this.base_url}/api/market_list`).then((res) => valuesToBigNumber(res.data))
			token_list_store.set(token_list)
			return token_list
		} catch (err) {
			console.error(err)
			throw err
		}
	}

	async getTokenBalances(vk: string) {
		try {
			const res = await axios.get(`${this.base_url}/api/balances/${vk}`).then((res) => valuesToBigNumber(res.data))
			return res
		} catch (err) {
			console.error(err)
		}
	}

	async getToken(contract_name: string) {
		try {
			const res = await axios.get(`${this.base_url}/api/token/${contract_name}`).then((res) => valuesToBigNumber(res.data))
			console.log({res})
			return res
		} catch (err) {
			console.error(err)
		}
	}

	async getUserLpBalance(vk: string) {
		try {
			const res = await axios.get(`${this.base_url}/api/user_lp_balance/${vk}`).then((res) => valuesToBigNumber(res.data))
			return res
		} catch (err) {
			return false
		}
	}

	async getPairs(contracts: string) {
		try {
			const res = await axios.get(`${this.base_url}/api/get_pairs/${contracts}`).then((res) => valuesToBigNumber(res.data))
			return res
		} catch (err) {
			return false
		}
	}

	async sendMessage(message: string){
		if (!get(bearerToken)) return false
		try {
			const res = await axios.post(`${this.base_url}/api/trollbox/message`, JSON.stringify({message}), {
				headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${get(bearerToken)}`,
				}
			})
			return res
		} catch (err) {
			console.log(err)
			//removeLSValue('auth_token')
			return false
		}
	}
}
