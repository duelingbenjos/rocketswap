import Lamden from 'lamden-js'
import { config, connectionRequest, stamps } from './config'
import BigNumber from 'bignumber.js'
import { get } from 'svelte/store'
import { 
	lwc_info, 
	walletIsReady, 
	tokenBalances, 
	walletBalance, 
	lpBalances, 
	saveStoreValue, 
	bearerToken, 
	lamdenWalletAutoConnect,
	slippageTolerance,
	rswpPrice,
	payInRswp } from './store'

import { ApiService } from './services/api.service'

let API = new Lamden.Masternode_API({ hosts: [config.masternode] })

export const replaceAll = (string, char, replace) => {
	return string.split(char).join(replace)
}

export const removeTAUBalance = async () => walletBalance.set("0")

export const refreshLpBalances = async (account = undefined) => {
	if (!account) account = get(lwc_info).walletAddress
	if (!account) return {}

	const apiService = ApiService.getInstance();

	let balances = await apiService.getUserLpBalance(account)
	if (balances?.points) balances = balances.points
	else balances = {}

	lpBalances.set(balances)
	return balances
}
export const getRswapPrice = async () => {
	let reserves = await API.getVariable(connectionRequest.contractName, 'reserves', 'con_rswp_lst001') 
	if (Array.isArray(reserves)){
		if (reserves[0].__fixed__) reserves[0] = toBigNumber(reserves[0].__fixed__)
		else reserves[0] = toBigNumber(reserves[0])
		if (reserves[1].__fixed__) reserves[1] = toBigNumber(reserves[1].__fixed__)
		else reserves[1] = toBigNumber(reserves[1])
		let quote = quoteCalculator({reserves})
		rswpPrice.set(quote.prices.token)
		return quote.prices.token
	}
}

export const removeLpBalances = async () => lpBalances.set({})

export const setBearerToken = (account = undefined) => {
	if (!account) account = get(lwc_info).walletAddress
	if (!account) return
	let tokenInfo = localStorage.getItem('auth_token')
	if (tokenInfo) {
		tokenInfo = JSON.parse(tokenInfo)
		if (tokenInfo?.user?.vk === account) {
			bearerToken.set(tokenInfo?.payload?.token || null)
		}
		else removeLSValue('auth_token')
	}
}

export const removeBearerToken = () => {
	removeLSValue('auth_token')
	bearerToken.set(null)
}

export const stampsToTAU = (stampCost) => stampCost / stamps.currentRatio

export const getBaseUrl = (url): string => {
  const parts = url.split(':')
  return `${parts[0]}:${parts[1]}`
}

export const openNewTab = (url) => window.open(url);

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

export const checkForApproval = (account: string) => {
  return fetch(`${config.masternode}/contracts/currency/balances?key=${account}:${connectionRequest.contractName}`)
    .then((res) => res.json())
    .then((json) => {
      return json.value as number
    })
    .catch((e) => console.error(e.message))
}

export const formatAccountAddress = (account: string, lsize = 4, rsize = 4) => {
  return account.substring(0, lsize) + '...' + account.substring(account.length - rsize)
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


export const stringToFixed = (value: string, precision: number) => {
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


export const toBigNumber = (value) => {
  if (Lamden.Encoder.BigNumber.isBigNumber(value)) return value
  return Lamden.Encoder.BigNumber(value)
}

export const isBigNumber = (value) => Lamden.Encoder.BigNumber.isBigNumber(value)

export const toBigNumberPrecision = (value, precision) => {
	if (!isBigNumber(value)) return toBigNumber("0")
	return toBigNumber(stringToFixed(value, precision))
  }

/**
 * Recurses through any object, converts stringified numbers and numbers to BigNumber.
 * Probably some edge cases I've ignored here, like what happens if it finds a BigNumber in the object ?
 */

export function valuesToBigNumber(obj: any) {
  if (typeof obj === 'object') {
    for (let property in obj) {
      if (property === 'time' || property === 'vk') {
        // ignore these values
      } else if (typeof obj[property] === 'string') {
        // Check if item is a string
        if (!isNaN(parseFloat(obj[property]))) obj[property] = new BigNumber(obj[property])
      } else if (typeof obj[property] === 'number') {
        obj[property] = new BigNumber(obj[property])
      } else if (typeof obj[property] === 'object') {
        valuesToBigNumber(obj[property])
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
		let fee = toBigNumberPrecision(tokensPurchased.multipliedBy(0.03), 8)
		let tokensPurchasedLessFee = toBigNumberPrecision(tokensPurchased.minus(fee), 8)

		return {
			tokensPurchased,
			fee,
			rswpFee: calcFeeInRswp_FromTokenFee(fee),
			tokensPurchasedLessFee,
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
		let fee = toBigNumberPrecision(currencyPurchased.multipliedBy(0.03), 8)
		let currencyPurchasedLessFee = toBigNumberPrecision(currencyPurchased.minus(fee), 8)

		return {
			currencyPurchased,
			fee,
			rswpFee: calcFeeInRswp_FromCurrencyFee(fee),
			currencyPurchasedLessFee,
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
		let fee = toBigNumberPrecision(minimumCurrency.multipliedBy(0.03), 8)
		let minimumCurrencyLessFee = toBigNumberPrecision(minimumCurrency.minus(fee), 8)
		console.log({
			slipTol: slipTol.toString(),
			slipTolDec: slipTolDec.toString(),
			slipTolDecInverted: slipTolDecInverted.toString(),
			tokenAmount: tokenAmount.toString(),
			prices_currency: prices.currency.toString(),
			prices_token: prices.token.toString(),
			maxSlippagePrice: maxSlippagePrice.toString(),
			tokensPurchased: maxSlippagePrice.toString(),
			fee: fee.toString(),
			minimumTokens: minimumCurrency.toString()
		})
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
		let fee = toBigNumberPrecision(minimumTokens.multipliedBy(0.03), 8)
		let minimumTokensLessFee = toBigNumberPrecision(minimumTokens.minus(fee), 8)
		console.log({
			slipTol: slipTol.toString(),
			slipTolDec: slipTolDec.toString(),
			slipTolDecInverted: slipTolDecInverted.toString(),
			currencyAmount: currencyAmount.toString(),
			prices_currency: prices.currency.toString(),
			prices_token: prices.token.toString(),
			maxSlippagePrice: maxSlippagePrice.toString(),
			minimumTokens: minimumTokens.toString(),
			fee: fee.toString(),
			minimumTokensLessFee: minimumTokensLessFee.toString()
		})
		return {
			minimumTokensLessFee,
			minimumTokens
		}
	}

	const calcFeeInRswp_FromCurrencyFee = (amount) => {
		let rswpAmount = get(rswpPrice).multipliedBy(amount)
		console.log({
			'rswpPrice': get(rswpPrice).toString(),
			rswpAmount: rswpAmount.toString()
		})
		return rswpAmount
		// fee is usually 0.3%
		// fee paid in RSWP is the value of the TOKEN or currency in RSWAP

		// get the amount of the fee in tokens

	}
	const calcFeeInRswp_FromTokenFee = (amount) => {
		let tokenFeeToCurrency = prices.token.multipliedBy(amount)
		let rswpAmount = get(rswpPrice).multipliedBy(tokenFeeToCurrency)
		console.log({
			'rswpPrice': get(rswpPrice).toString(),
			tokenFeeToCurrency: tokenFeeToCurrency.toString(),
			rswpAmount: rswpAmount.toString()
		})
		return rswpAmount
		// fee is usually 0.3%
		// fee paid in RSWP is the value of the TOKEN or currency in RSWAP
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
				if (!location.pathname.includes(get(selectedToken).contract_name))
				  window.history.pushState("", "", `/#/${route}${get(selectedToken).contract_name}`);
			  }
		}else{
			window.history.pushState("", "", `/#/${route}`);
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
