import Lamden from 'lamden-js'
import { config, connectionRequest, stamps } from './config'
import { get } from 'svelte/store'
import { 
	lwc_info, 
	walletIsReady, 
	tokenBalances, 
	lpBalances, 
	saveStoreValue, 
	bearerToken, 
	lamdenWalletAutoConnect,
	slippageTolerance,
	rswpPrice, 
	earnFilters,
	payInRswp, 
	ammFuelTank,
	ammFuelTank_discount,
	rswpMetrics,
	tauUSDPrice,
	currencyType,
	homePageTableFilter} from './store'

import { ApiService } from './services/api.service'
import { LamdenBlockexplorer_API } from './services/blockexplorer.service'

export const replaceAll = (string, char, replace) => {
	return string.split(char).join(replace)
}

export const getAmmStakeDetails = async (account = undefined) => {
	if (!account) account = get(lwc_info)?.walletAddress
	if (!account) return
	const blockExplorerService = LamdenBlockexplorer_API.getInstance()

	let keyList = [
		{
			"contractName": connectionRequest.contractName,
			"variableName": "staked_amount",
			"key": `${account}:${config.ammTokenContract}`
		},
		{
			"contractName": connectionRequest.contractName,
			"variableName": "discount",
			"key": account
		}
	]
	let res = await blockExplorerService.getKeys(keyList)
	ammFuelTank.set( {
		'stakedAmount': res[`${keyList[0].contractName}.${keyList[0].variableName}:${keyList[0].key}`] || null,
		'discount': res[`${keyList[1].contractName}.${keyList[1].variableName}:${keyList[1].key}`] || null
	})
}

export const removeLpBalances = async () => lpBalances.set({})

export const setBearerToken = (account = undefined) => {
	if (!account) account = get(lwc_info).walletAddress
	if (!account) return
	let tokenInfo = localStorage.getItem('auth_token')
	if (tokenInfo) {
		tokenInfo = JSON.parse(tokenInfo)
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		if (tokenInfo?.user?.vk === account) {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			bearerToken.set(tokenInfo?.payload?.token || null)
		}
		else removeLSValue('auth_token')
	}
}

export const removeBearerToken = () => {
	removeLSValue('auth_token')
	bearerToken.set(null)
}

export const stampsToTAU = (stampCost) => {
	let currentRatio = toBigNumber(stamps.currentRatio)
	let sc = toBigNumber(stampCost)
	return toBigNumberPrecision(sc.dividedBy(currentRatio), 8)
}

export const openNewTab = (url) => window.open(url, "_blank", {});

export const createBlockExplorerLink = (route, id) => `${config.blockExplorer}/${route}/${id}`

export const setLamdenWalletAutoConnectStore = () => {
	let autoConnect = localStorage.getItem("lamden_wallet_autoconnect")
	if (autoConnect === null) lamdenWalletAutoConnect.set(false)
	else lamdenWalletAutoConnect.set(JSON.parse(autoConnect))
}
export const toggleLamdenWalletAutoConnect = () => {
	let autoConnect = get(lamdenWalletAutoConnect)
	if (autoConnect) {
		setLSValue("lamden_wallet_autoconnect", false)
	}else{
		setLSValue("lamden_wallet_autoconnect", true)
	}
	setLamdenWalletAutoConnectStore()
}
export const initializeStateFromLocalStorage = () => {
	getSlippageTolerance()
	getPayInRswp()
	getEarnFilters()
	getTauUsdPrice()
	getCurrencyType()
	getHomePageTableFilter()
}
export const getSlippageTolerance = () => {
	let st = localStorage.getItem("slippage_tolerance")
	if (st === null) slippageTolerance.set(toBigNumber("1.0"))
	else slippageTolerance.set(toBigNumber(JSON.parse(st)))
}
export const setSlippageTolerance = (value) => {
	setLSValue("slippage_tolerance", value.toString())
	slippageTolerance.set(value)
}
export const getPayInRswp = () => {
	let value = localStorage.getItem("pay_in_rswp")
	if (value=== null) payInRswp.set(false)
	else payInRswp.set(JSON.parse(value))
}
export const setPayInRswp = (value) => {
	setLSValue("pay_in_rswp", value)
	payInRswp.set(value)
}
export const getEarnFilters = () => {
	let value = localStorage.getItem("earn_filters")
	if (value === null) return
	else earnFilters.set(JSON.parse(value))
}
export const setEarnFilters = (value) => {
	setLSValue("earn_filters", value)
	earnFilters.set(value)
}
export const getTauUsdPrice = () => {
	let value = localStorage.getItem("tau_usd_price")
	if (value === null) tauUSDPrice.set(toBigNumber(0))
	else tauUSDPrice.set(toBigNumber(JSON.parse(value)))
}
export const setTauUsdPrice = (value) => {
	setLSValue("tau_usd_price", value)
}
export const getCurrencyType = () => {
	let value = localStorage.getItem("currency_type")
	if (value === null) currencyType.set("tau")
	else currencyType.set(JSON.parse(value))
}
export const setCurrencyType = (value) => {
	setLSValue("currency_type", value)
	currencyType.set(value)
}
export const getHomePageTableFilter = () => {
	let value = localStorage.getItem("home_page_talbe_filters")
	if (value === null) homePageTableFilter.set({volume: "asc", price: "asc", name: "asc", current: "volume"})
	else homePageTableFilter.set(JSON.parse(value))
}
export const setHomePageTableFilter = (volume, price, name, current) => {
	setLSValue("home_page_talbe_filters", {volume, price, name, current})
}
export const setLSValue = (key, value) => {
	localStorage.setItem(key, JSON.stringify(value))
}
export const removeLSValue = (key) => localStorage.removeItem(key)

export const hasSavedKeystoreData = () => {
	let keystoreData = localStorage.getItem("encrypted_keystore_data")
	if (keystoreData === null) return false
	if (keystoreData) return true
	return false
}

export const getSavedKeystoreData = () => {
	if (hasSavedKeystoreData()) return JSON.parse(JSON.parse(localStorage.getItem("encrypted_keystore_data")))
	return null
}


export const formatAccountAddress = (account: string, lsize = 4, rsize = 4) => {
  return account.substring(0, lsize) + '...' + account.substring(account.length - rsize)
}

export const numberWithCommas = (x) => {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export const returnFloat = (value: any) => {
  return { __fixed__: parseFloat(value).toFixed(9) }
}

export const isLamdenKey = (key) => {
  if (key.length === 64) return true
  return false
}

export const calculateRgba = (input, opacity) => {
  let color
  if (input[0] === `#`) {
    color = input.slice(1)
  }

  if (color.length === 3) {
    let res = ``
    color.split(``).forEach((c) => {
      res += c
      res += c
    })
    color = res
  }

  const rgbValues = color
    .match(/.{2}/g)
    .map((hex) => parseInt(hex, 16))
    .join(`, `)
  return `rgba(${rgbValues}, ${opacity})`
}


export const stringToFixed = (value, precision) => {
	if (isBigNumber(value) && precision ) value = value.toFixed(precision)
	if (!value) return "0.0"
		try {
			var values = value.split('.')
		} catch {
			var values = value.toString().split('.')
		}
		if (!values[1]) return value
		else {
			if (values[1].length < precision) precision = values[1].length
				let decValue = parseInt(values[1].substring(0, precision))
			if (decValue === 0) return `${values[0]}`
			else {
				let decimals = values[1].substring(0, precision)
				for (let i = precision - 1; i >= 0; i--) {
					if (decimals[i] === '0') precision -= 1
					else i = -1
			}
			return `${values[0]}.${values[1].substring(0, precision)}`
		}
	}
}

export const determinePrecision = (value) => {
	if (isBigNumber(value)) value = value.toString()
	let valueStripped = stripTrailingZero(value)
	if (!valueStripped.includes(".")) return 0
	else {
		return valueStripped.split(".")[1].length
	}

}

export const range = (size, startAt = 0) => [...Array(size).keys()].map((i) => i + startAt)

export const characterRange = (startChar, endChar) => String.fromCharCode(...range(endChar.charCodeAt(0) - startChar.charCodeAt(0), startChar.charCodeAt(0)))

export const zip = (arr, ...arrs) => arr.map((val, i) => arrs.reduce((list, curr) => [...list, curr[i]], [val]))

export const stripTrailingZero = (value: string): string => {
  const removeZeros = (v) => {
    const numParts = v.split('.')
    let formatted = numParts[1]
    for (let i = numParts[1].length - 1; numParts[1][i] === '0' && typeof numParts[1][i] !== 'undefined'; i--) {
      formatted = formatted.slice(0, -1)
    }
    if (formatted === '') return numParts[0]
    return numParts[0] + '.' + formatted
  }
  const isDecmailString = (v) => {
    if (typeof v !== 'string') return false
    if (v.includes('.')) return true
    return false
  }
  if (isDecmailString(value)) {
    return removeZeros(value)
  } else {
    return value
  }
}

export const __fixed__ToBigNumber = (value) => {
	if(!value) return toBigNumber("0")
	if (value.__fixed__) return toBigNumberPrecision(value.__fixed__, 8)
	return toBigNumberPrecision(value, 8)
}


export const toBigNumber = (value) => {
  if (Lamden.Encoder.BigNumber.isBigNumber(value)) return value
  return Lamden.Encoder.BigNumber(value)
}

export const isBigNumber = (value) => Lamden.Encoder.BigNumber.isBigNumber(value)

export const toBigNumberPrecision = (value = null, precision) => {
	if (value === null) return toBigNumber("0")
	try{
		return toBigNumber(stringToFixed(toBigNumber(value).toFixed(precision), precision))
	}catch(e){
		return toBigNumber("0")
	}
}

export const displayBalanceToPrecision = (value, precision) => {
	if (!value) return "0"
	return toBigNumberPrecision(value, precision).toFormat({  decimalSeparator: '.', groupSeparator: ',', groupSize: 3})
}

/**
 * Recurses through any object, converts stringified numbers and numbers to BigNumber.
 * Probably some edge cases I've ignored here, like what happens if it finds a BigNumber in the object ?
 */

export function valuesToBigNumber(obj: any) {
  if (typeof obj === 'object') {
    for (let property in obj) {
		if (!isBigNumber(obj[property])){
			if (	property === 'time' || 
					property === 'vk' || 
					property === 'time_updated' || 
					property === 'hash') {
				// ignore these values
			} else if (typeof obj[property] === 'string') {
				// Check if item is a string
				if (!isNaN(parseFloat(obj[property]))) {
					obj[property] = toBigNumberPrecision(obj[property], 8)
				}
			} else if (typeof obj[property] === 'number') {
				obj[property] = toBigNumberPrecision(obj[property], 8)
			} else if (typeof obj[property] === 'object') {
				valuesToBigNumber(obj[property])
			}
		}

    }
  }
  return obj
}

export const quoteCalculator = (tokenInfo) => {
	const currencyReserves = toBigNumberPrecision(toBigNumber(tokenInfo?.reserves[0] || "0"), 8)
	const tokenReserves = toBigNumberPrecision(toBigNumber(tokenInfo?.reserves[1] || "0"), 8)

	const prices = getPrices([currencyReserves, tokenReserves])

	const totalLP = tokenInfo?.lp || toBigNumber("0")
	const k = currencyReserves.multipliedBy(tokenReserves)

	function getPrices(reserves) {
		if (!reserves) return
		return {
			reserves,
			currency: toBigNumberPrecision(reserves[1].dividedBy(reserves[0]), 8),
			token: toBigNumberPrecision(reserves[0].dividedBy(reserves[1]), 8)
		}
	}

	const calcCurrencyValue = (value) =>  toBigNumberPrecision(prices.token.multipliedBy(value), 8)
	const calcTokenValue = (value) =>  toBigNumberPrecision(prices.currency.multipliedBy(value), 8)

	const calcLpPercent = (lp_balance) => toBigNumberPrecision(lp_balance.dividedBy(totalLP), 8)

	const calcTokenValueInCurrency = (lp_balance) => {
		const share = calcLpPercent(lp_balance)
		return  toBigNumberPrecision((currencyReserves.multipliedBy(share)) + (lp_balance.multipliedBy(share).multipliedBy(prices.currency) ), 8)
	}

	const calcPointsPerCurrency = () => toBigNumberPrecision(totalLP.dividedBy(currencyReserves), 8)

	const calcInitialLpMintAmount = () => toBigNumber(100);

	const calcNewLpMintAmount = (currencyAmount) => toBigNumberPrecision(calcPointsPerCurrency().multipliedBy(currencyAmount), 8)

	const calcNewShare = (lp_balance, currencyAmount) => {
		if (!currencyAmount || !lp_balance) return toBigNumber("0")
		currencyAmount = toBigNumberPrecision(currencyAmount, 8)
		lp_balance = toBigNumberPrecision(lp_balance, 8)
		let newLpMinted = calcNewLpMintAmount(currencyAmount)
		let newShare =  lp_balance.plus(newLpMinted).dividedBy(totalLP.plus(newLpMinted))
		if (newShare.isNaN()) return toBigNumber("0")
		return toBigNumberPrecision(newShare, 8)
	}

	const calcNewShare_removeTokens = (lpCurrentBalance, lpTokensToRemove) => {
		lpCurrentBalance = toBigNumberPrecision(lpCurrentBalance, 8)
		lpTokensToRemove = toBigNumberPrecision(lpTokensToRemove, 8)
		return toBigNumberPrecision(lpCurrentBalance.minus(lpTokensToRemove).dividedBy(totalLP.minus(lpTokensToRemove)), 8)
	}

	const calcAmountsFromLpTokens = (lpTokenAmount) => {
		if (!lpTokenAmount) return undefined
		lpTokenAmount = toBigNumberPrecision(lpTokenAmount, 8)
		let lp_percent = calcLpPercent(lpTokenAmount)
		return {
			currency: toBigNumberPrecision(currencyReserves.multipliedBy(lp_percent), 8),
			token: toBigNumberPrecision(tokenReserves.multipliedBy(lp_percent), 8)
		}
	}

	const calcBuyPrice = (currencyAmount) => {
		if (!currencyAmount) currencyAmount = toBigNumber("0")
		currencyAmount = toBigNumberPrecision(currencyAmount, 8)
		let newCurrencyReserve = currencyReserves.plus(currencyAmount)
		let newTokenReserve = toBigNumberPrecision(k.dividedBy(newCurrencyReserve), 8)
		let tokensPurchased = toBigNumberPrecision(tokenReserves.minus(newTokenReserve), 8)
		let feePercent = toBigNumber(config.ammFee)
		//console.log(feePercent.toString())
		let userAmmStakingDiscount = get(ammFuelTank_discount)
		//console.log({userAmmStakingDiscount: userAmmStakingDiscount.toString()})
		if (userAmmStakingDiscount.isGreaterThan(0)){
			feePercent = feePercent.multipliedBy(userAmmStakingDiscount)
		}
		
		let fee = toBigNumberPrecision(tokensPurchased.multipliedBy(feePercent), 8)
		//console.log({fee: fee.toString()})
		let tokensPurchasedLessFee = toBigNumberPrecision(tokensPurchased.minus(fee), 8)
		let pricePaid = tokensPurchased.isGreaterThan(0) ? tokensPurchased.dividedBy(currencyAmount) : false

		return {
			tokensPurchased,
			fee,
			rswpFee: calcFeeInRswp_FromTokenFee(fee, feePercent),
			tokensPurchasedLessFee,
			pricePaid,
			...calcMinimumTokens(currencyAmount),
			...calcSlippage(newTokenReserve, newCurrencyReserve)
		}
	}

	const calcSellPrice = (tokenAmount) => {
		if (!tokenAmount) tokenAmount = toBigNumber("0")
		tokenAmount = toBigNumberPrecision(tokenAmount, 8)
		let newTokenReserve = toBigNumberPrecision(tokenReserves.plus(tokenAmount), 8)
		let newCurrencyReserve = toBigNumberPrecision(k.dividedBy(newTokenReserve), 8)
		let currencyPurchased = toBigNumberPrecision(currencyReserves.minus(newCurrencyReserve), 8)
		let userAmmStakingDiscount = get(ammFuelTank_discount)
		
		let feePercent = toBigNumber(config.ammFee)
		if (userAmmStakingDiscount.isGreaterThan(0)){
			feePercent = feePercent.multipliedBy(userAmmStakingDiscount)
		}
		let fee = toBigNumberPrecision(currencyPurchased.multipliedBy(feePercent), 8)
		let currencyPurchasedLessFee = toBigNumberPrecision(currencyPurchased.minus(fee), 8)

		let pricePaid = currencyPurchased.isGreaterThan(0) ? currencyPurchased.dividedBy(tokenAmount) : false

		return {
			currencyPurchased,
			fee,
			rswpFee: calcFeeInRswp_FromCurrencyFee(fee, feePercent),
			currencyPurchasedLessFee,
			pricePaid,
			...calcMinimumCurrency(tokenAmount),
			...calcSlippage(newTokenReserve, newCurrencyReserve)
		}
	}

	const calcSlippage = (newTokenReserve, newCurrencyReserve) => {
		let newPrices = getPrices([newCurrencyReserve, newTokenReserve])

		if (newPrices.currency.isNaN()) newPrices.currency = toBigNumber("0.0")
		if (newPrices.token.isNaN()) newPrices.token = toBigNumber("0.0")

		return {
			prices,
			newPrices,
			tokenSlippage: toBigNumberPrecision(prices.token.dividedBy(newPrices.token).minus(1).multipliedBy(100).absoluteValue(), 8),
			currencySlippage: toBigNumberPrecision(prices.currency.dividedBy(newPrices.currency).minus(1).multipliedBy(100).absoluteValue(), 8)
		}
	}

	const calcMinimumCurrency = (tokenAmount) => {
		let slipTol = get(slippageTolerance)
		if (slipTol.isLessThanOrEqualTo(0)) {
			return {
				minimumCurrency: toBigNumber("0.0"),
				minimumCurrencyLessFee: toBigNumber("0.0")
			}
		}
		
		let slipTolDec = slipTol.dividedBy(100)
		let slipTolDecInverted = toBigNumber(1).minus(slipTolDec)
		let maxSlippagePrice = toBigNumberPrecision(prices.token.multipliedBy(slipTolDecInverted), 8)
		let minimumCurrency = toBigNumberPrecision(tokenAmount.multipliedBy(maxSlippagePrice), 8)
		let fee = toBigNumberPrecision(minimumCurrency.multipliedBy(toBigNumber(config.ammFee)), 8)
		let minimumCurrencyLessFee = toBigNumberPrecision(minimumCurrency.minus(fee), 8)

		return {
			minimumCurrency,
			minimumCurrencyLessFee,
		}
	}

	const calcMinimumTokens = (currencyAmount) => {
		let slipTol = get(slippageTolerance)
		if (slipTol.isLessThanOrEqualTo(0)) {
			return {
				minimumTokens: toBigNumber("0.0"),
				minimumTokensLessFee: toBigNumber("0.0")
			}
		}
		let slipTolDec = slipTol.dividedBy(100)
		let slipTolDecInverted = toBigNumber(1).minus(slipTolDec)
		let maxSlippagePrice = toBigNumberPrecision(prices.currency.multipliedBy(slipTolDecInverted), 8)
		let minimumTokens = toBigNumberPrecision(currencyAmount.multipliedBy(maxSlippagePrice), 8)
		let fee = toBigNumberPrecision(minimumTokens.multipliedBy(toBigNumber(config.ammFee)), 8)
		let minimumTokensLessFee = toBigNumberPrecision(minimumTokens.minus(fee), 8)

		return {
			minimumTokensLessFee,
			minimumTokens
		}
	}

	const calcFeeInRswp_FromCurrencyFee = (feeAmount, feePercent) => {
		let rswpPairInfo = get(rswpMetrics)
		if (!rswpPairInfo) return

		let tokenDiscount = toBigNumber(config.ammTokenDiscount)
		//console.log({tokenDiscount: tokenDiscount.toString()})

		feeAmount = feeAmount.multipliedBy(tokenDiscount)
		//console.log({feeAmount: feeAmount.toString()})


		let rswpCurrencyReserves = toBigNumber(rswpPairInfo.reserves[0])
		let rswpTokenReserves = toBigNumber(rswpPairInfo.reserves[1])

		let rswpK = rswpCurrencyReserves.multipliedBy(rswpTokenReserves)
		let rswpNewCurrencyReserve = rswpCurrencyReserves.plus(feeAmount)
		rswpNewCurrencyReserve = rswpNewCurrencyReserve.plus(feeAmount.multipliedBy(feePercent))
		let rswpNewTokenReserve = rswpK.dividedBy(rswpNewCurrencyReserve)

		return rswpTokenReserves.minus(rswpNewTokenReserve)
	}
	const calcFeeInRswp_FromTokenFee = (feeAmount, feePercent) => {
		//console.log({feeAmount: feeAmount.toString()})
		//console.log({feePercent: feePercent.toString()})
		let rswpPairInfo = get(rswpMetrics)
		if (!rswpPairInfo) return

		let tokenDiscount = toBigNumber(config.ammTokenDiscount)
		//console.log({tokenDiscount: tokenDiscount.toString()})

		feeAmount = feeAmount.multipliedBy(tokenDiscount)
		//console.log({feeAmount: feeAmount.toString()})

		let k = toBigNumberPrecision(currencyReserves.multipliedBy(tokenReserves), 8)
		//console.log({k: k.toString()})

		let newTokenReserve = tokenReserves.plus(feeAmount)
		//console.log({newTokenReserve: newTokenReserve.toString()})

		let newCurrencyReserve = toBigNumberPrecision(k.dividedBy(newTokenReserve), 8)
		//console.log({newCurrencyReserve: newCurrencyReserve.toString()})

		let currencyPurchased = toBigNumberPrecision(currencyReserves.minus(newCurrencyReserve), 8)
		//console.log({currencyPurchased: currencyPurchased.toString()})

		currencyPurchased = currencyPurchased.plus(toBigNumberPrecision(currencyPurchased.multipliedBy(feePercent), 8))
		//console.log({currencyPurchased: currencyPurchased.toString()})


		let rswpCurrencyReserves = toBigNumber(rswpPairInfo.reserves[0])
		let rswpTokenReserves = toBigNumber(rswpPairInfo.reserves[1])

		let rswpK = rswpCurrencyReserves.multipliedBy(rswpTokenReserves)
		let rswpNewCurrencyReserve = rswpCurrencyReserves.plus(currencyPurchased)
		rswpNewCurrencyReserve = rswpNewCurrencyReserve.plus(currencyPurchased.multipliedBy(feePercent))
		let rswpNewTokenReserve = rswpK.dividedBy(rswpNewCurrencyReserve)

		return rswpTokenReserves.minus(rswpNewTokenReserve)
	}

	return {
		prices,
		currencyReserves,
		tokenReserves,
		toBigNumber,
		isBigNumber,
		calcCurrencyValue,
		calcTokenValue,
		calcLpPercent,
		calcTokenValueInCurrency,
		calcNewShare, calcNewShare_removeTokens,
		calcPointsPerCurrency,
		calcNewLpMintAmount, calcInitialLpMintAmount,
		calcAmountsFromLpTokens,
		calcBuyPrice, calcSellPrice,
	}
}


/*
  PAGE UTILS
*/

export const pageUtils = (pageStores) => {
	//Stores
	const {
		selectedToken,
		tokenLP,
	  } = pageStores

	//Services
	const apiService = ApiService.getInstance();

	const refreshTokenInfo = async (contractName) => {
		if (!contractName) return
		let tokenRes = await getTokenInfo(contractName)
		if (!tokenRes || Object.keys(tokenRes).length === 0) return false;
		applyTokenBalance(tokenRes)
		const { token, lp_info }  = tokenRes
		saveStoreValue(selectedToken, token)
		saveStoreValue(tokenLP, lp_info)
		return true
	}

	const getTokenInfo = async (contractName) => {
		return apiService.getToken(contractName)
	}

	const applyTokenBalance = (tokenRes) => {
		if (!get(walletIsReady)) tokenRes.token.balance = 0
		else tokenRes.token.balance = get(tokenBalances)[tokenRes.token.contract_name] || 0;
		return tokenRes
	}

	const updateWindowHistory = (route, contractExists = true) => {
		if (contractExists){
			if (get(selectedToken)){
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				if (!location.pathname.includes(get(selectedToken).contract_name))
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-ignore
				  //window.history.pushState("", "", `/#/${route}${get(selectedToken).contract_name}`);
				  window.history.replaceState("", "", `/#/${route}${get(selectedToken).contract_name}`);
				  location.hash = `/${route}${get(selectedToken).contract_name}`
			  }
		}else{
			window.history.replaceState("", "", `/#/${route}`);
		}	

	}

	const redirectToAddPool = (contractName) => window.location.assign(`/#/pool-add/${contractName}`)
	const redirectToCreatePool = (contractName) => window.location.assign(`/#/pool-create/${contractName}`)
	const redirectPoolMain = () => window.location.assign(`/#/pool-main/`)

	  
	const resetPage = (contractName, stores) => {
		stores.forEach(store => store.set(null))
		setTimeout(() => refreshTokenInfo(contractName), 2000)
	}

	return {
		refreshTokenInfo,
		getTokenInfo,
		updateWindowHistory,
		applyTokenBalance,
		redirectToAddPool, redirectPoolMain, redirectToCreatePool,
		resetPage
	}
}

export const unixToLocalTimestamp = (timestamp: string) => {
	// console.log(timestamp)
	let date = new Date(parseInt(timestamp))

	let hours = ("0" + date.getHours()).substr(-2);
	let minutes = ("0" + date.getMinutes()).substr(-2);
	let seconds = ("0" + date.getSeconds()).substr(-2);

	return `${hours}:${minutes}:${seconds}`
}

/*
	Staking Calculations
*/

export const stakingCalculator = (stakingInfo) => {
	const calcNewYeild = (userYieldInfo) => {
		//console.log({calcNewYeild: userYieldInfo})
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		if (!userYieldInfo?.yield_per_sec) return toBigNumber("0");

		/*
		console.log({
			userYieldInfo,
			yield_per_sec: userYieldInfo?.yield_per_sec.toString(),
			elapsed: toBigNumber(new Date() - userYieldInfo.time_updated).dividedBy(1000).toString(),
			additional: userYieldInfo.yield_per_sec.multipliedBy(toBigNumber(new Date() - userYieldInfo.time_updated).dividedBy(1000)).toString()
		})*/
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		return userYieldInfo.yield_per_sec.multipliedBy(toBigNumber(new Date() - userYieldInfo.time_updated).dividedBy(1000))
	}

	/** Simple Staking ROI */
	const calcEmissionRatePerYear = () => {
		if (!stakingInfo?.EmissionRatePerHour) return toBigNumber("0")
		// return stakingInfo?.EmissionRatePerHour.multipliedBy(24).multipliedBy(365);
		return stakingInfo?.ROI_yearly
	}

	return {
		calcNewYeild,
		emissionRatePerYear: calcEmissionRatePerYear()
	}
}