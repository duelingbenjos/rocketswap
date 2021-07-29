import { Writable, writable, derived, get } from 'svelte/store'
import type { TokenListType, TokenMetricsType, TokenSelectType } from './types/api.types'

//Services
import { ApiService } from './services/api.service'
import { WsService } from './services/ws.service'

import type { ToastMetaType } from './types/toast.types'
import { toBigNumber, toBigNumberPrecision } from './utils'
import { config, currencyToken, contract_blacklist } from './config'
import CurrencyLogo from './icons/lamden-logo.svelte'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
currencyToken.logo_component = CurrencyLogo

export const saveStoreValue = (store, value) => {
	let currValue = JSON.stringify(get(store))
	let newValue = JSON.stringify(value)
	if (currValue !== newValue) store.set(value)
}

// SITE MISC
export const mainMenuOpen = writable(false);
export const epochs = writable({});
export const rocketState = writable(0);
export const toast_store: Writable<ToastMetaType[]> = writable([])
export const tabHidden = writable(false);
export const currencyType = writable(undefined);
export const homePageTableFilter = writable(undefined);
export const onboarding_settings = writable({});

// EXCHANGE PRICES
export const tauUSDPrice = writable(null);

// WALLET
export const ws_id: Writable<string> = writable('')
export const token_metrics_store: Writable<TokenMetricsType> = writable({})
export const token_list_store: Writable<TokenListType[]> = writable([])
export const tokenBalances = writable({})
export const keystore = writable(null);
export const lamdenWalletAutoConnect = writable(false);
export const lwc_info = writable({
	installed: null,
	locked: null,
	walletAddress: '',
	approved: false
})

export const walletBalance = derived(tokenBalances, ($tokenBalances) => {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	return $tokenBalances?.currency ? $tokenBalances.currency : toBigNumber("0")
})

export const walletAddress = derived([lwc_info, keystore], ([$lwc_info, $keystore]) => {
	if ($lwc_info?.approved && $lwc_info?.walletAddress) return $lwc_info?.walletAddress
	if ($keystore) return $keystore.wallets[0].vk
	return null
})

export const walletIsReady = derived([lwc_info, keystore], ([$lwc_info, $keystore]) => {
	if ($keystore?.wallets?.length > 0) return true
	return $lwc_info.installed === true && $lwc_info.locked === false && $lwc_info.approved === true && $lwc_info.walletAddress.length > 0
})

// STAKING GENERAL
export const stakingInfo = writable([]);
export const userYieldInfo = writable({});

export const stakingInfoProcessed = derived(stakingInfo, ($stakingInfo) => {
	return $stakingInfo.filter(stakeInfo => !contract_blacklist.includes(stakeInfo.contract_name))
		.map(stakeInfo => {
			if (!stakeInfo.yield_token && stakeInfo.meta.YIELD_TOKEN === "currency") stakeInfo.yield_token = currencyToken
			if (!stakeInfo.staking_token && stakeInfo.meta.STAKING_TOKEN === "currency") stakeInfo.staking_token = currencyToken
			return stakeInfo
		})
})

// RSWP
export const payInRswp = writable(false)

export const rswpBalance = derived(tokenBalances, ($tokenBalances) => {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	return $tokenBalances?.con_rswp_lst001 ? $tokenBalances.con_rswp_lst001 : toBigNumber("0")
})

export const rswpStakingInfo = derived(stakingInfoProcessed, ($stakingInfoProcessed) => {
	return $stakingInfoProcessed.find(info => info.contract_name === config.ammTokenStakingContract) || null
})

export const rswpYieldInfo = derived(stakingInfoProcessed, ($stakingInfoProcessed) => {
	return $stakingInfoProcessed.find(info => info.contract_name === config.ammTokenYieldContract) || null
})

export const rswpPrice = derived(token_metrics_store, ($token_metrics_store) => {
	let currentPrice = toBigNumber("0")
	let rswpMetrics = $token_metrics_store[config.ammTokenContract]
	if (rswpMetrics){
		currentPrice = toBigNumberPrecision(rswpMetrics.price, 8)
	}
	return  currentPrice
})

export const rswpMetrics = derived(token_metrics_store, ($token_metrics_store) => {
	console.log($token_metrics_store[config.ammTokenContract])
	return  $token_metrics_store[config.ammTokenContract] || null
})

export const rswpPriceUSD = derived(([rswpPrice, tauUSDPrice]), ([$rswpPrice, $tauUSDPrice]) => {
	if ($rswpPrice.isGreaterThan(0) && $tauUSDPrice) return $rswpPrice.multipliedBy($tauUSDPrice)
	else toBigNumber("0")
})

// AMM
export const accountName = writable(null);  // ROCKET-ID
export const earnFilters = writable({});
export const farmFilter = writable(null);
export const farmStakedByMe = writable(false);
export const farmShowClosed = writable(false);

export const farmFilterUpDown = writable("down");
export const slippageTolerance = writable(toBigNumber("1.0"));

export const ammFuelTank = writable({})
export const ammFuelTank_stakedAmount = derived(ammFuelTank, ($ammFuelTank) => $ammFuelTank?.stakedAmount || toBigNumber("0"))
export const ammFuelTank_discount = derived(ammFuelTank, ($ammFuelTank) => $ammFuelTank?.discount || toBigNumber("0"))

// AMM TROLLBOX
export const trollBoxOpen = writable(null);
export const trollboxMessages = writable([]);
export const bearerToken = writable(null)

//AMM TRADES
export const tradeHistory = writable({});
export const tradeUpdates = writable({});
export const allTradeUpdates = writable([]);


// POOLS AND LIQUIDITY
export const lpBalances = writable({})

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export const lpPairs = derived(lpBalances, async ($lpBalances, set) => {
	if (Object.keys($lpBalances).length === 0) {
		set([])
		return
	}
	const apiService = ApiService.getInstance();
	const wsService = WsService.getInstance();
	const contracts = Object.keys($lpBalances).join(',')
	let pairsRes = await apiService.getPairs(contracts)
	let pairsList = Object.keys(pairsRes).map(key => pairsRes[key])
	pairsList.map(pair => {
		wsService.joinTokenMetricsFeed(pair.contract_name)
	})
	if (pairsRes) set(pairsList)
	else set([])


})