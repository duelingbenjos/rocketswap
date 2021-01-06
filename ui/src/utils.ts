import Lamden from 'lamden-js'
import { config } from './config'
import BigNumber from 'bignumber.js'

let API = new Lamden.Masternode_API({ hosts: [config.masternode] })

export const replaceAll = (string, char, replace) => {
  return string.split(char).join(replace)
}

export const refreshTAUBalance = async (account) => {
  const res = await API.getCurrencyBalance(account)
  return res
}

export const getBaseUrl = (url): string => {
  const parts = url.split(':')
  return `${parts[0]}:${parts[1]}`
}

export const checkForApproval = (account: string) => {
  return fetch(`${config.masternode}/contracts/currency/balances?key=${account}:${config.contractName}`)
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
    // console.log(typeof v)
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
	const currencyReserves = toBigNumber(tokenInfo?.reserves[0] || ["0", "0"])
  const tokenReserves = toBigNumber(tokenInfo?.reserves[1] || ["0", "0"])
  
  const prices = getPrices([currencyReserves, tokenReserves])

  const totalLP = tokenInfo?.lp || toBigNumber("0")
  const k = currencyReserves.multipliedBy(tokenReserves)

  function getPrices(reserves) {
    if (!reserves) return
    return {
      reserves,
      currency: reserves[1].dividedBy(reserves[0]),
      token: reserves[0].dividedBy(reserves[1])
    }
  }

	const calcCurrencyValue = (value) =>  prices.token.multipliedBy(value)
	const calcTokenValue = (value) =>  prices.currency.multipliedBy(value)

	const calcLpPercent = (lp_balance) => lp_balance.dividedBy(totalLP)

	const calcTokenValueInCurrency = (lp_balance) => {
        const share = calcLpPercent(lp_balance)
        return  (currencyReserves.multipliedBy(share)) + (lp_balance.multipliedBy(share).multipliedBy(prices.currency) )
	}

  const calcPointsPerCurrency = () => totalLP.dividedBy(currencyReserves)
  
  const calcInitialLpMintAmount = () => toBigNumber(100);

	const calcNewLpMintAmount = (currencyAmount) => calcPointsPerCurrency().multipliedBy(currencyAmount) 

	const calcNewShare = (lp_balance, currencyAmount) => {
		let newLpMinted = calcNewLpMintAmount(currencyAmount)
    let newShare =  lp_balance.plus(newLpMinted).dividedBy(totalLP.plus(newLpMinted))
    if (newShare.isNaN) return toBigNumber("0")
    return newShare
  }

  const calcNewShare_removeTokens = (lpCurrentBalance, lpTokensToRemove) => {
    return lpCurrentBalance.minus(lpTokensToRemove).dividedBy(totalLP.minus(lpTokensToRemove))
  }
  
  const calcAmountsFromLpTokens = (lpTokenAmount) => {
    if (!lpTokenAmount) return undefined

    let lp_percent = calcLpPercent(lpTokenAmount)
    return {
      currency: currencyReserves.multipliedBy(lp_percent),
      token: tokenReserves.multipliedBy(lp_percent)
    }
  }

  const calcBuyPrice = (currencyAmount) => {
    let newCurrencyReserve = currencyReserves.plus(currencyAmount)
    let newTokenReserve = k.dividedBy(newCurrencyReserve)
    let tokensPurchased = tokenReserves.minus(newTokenReserve)
    let fee = tokensPurchased.multipliedBy(0.03)
    let tokensPurchasedLessFee = tokensPurchased.minus(fee)

    return {
      tokensPurchased,
      fee,
      tokensPurchasedLessFee,
      ...calcSlippage(newTokenReserve, newCurrencyReserve)
    }
  }

  const calcSellPrice = (tokenAmount) => {
    let newTokenReserve = tokenReserves.plus(tokenAmount)
    let newCurrencyReserve = k.dividedBy(newTokenReserve)
    let currencyPurchased = currencyReserves.minus(newCurrencyReserve)
    let fee = currencyPurchased.multipliedBy(0.03)
    let currencyPurchasedLessFee = currencyPurchased.minus(fee)

    return {
      currencyPurchased,
      fee,
      currencyPurchasedLessFee,
      ...calcSlippage(newTokenReserve, newCurrencyReserve)
    }
  }

  const calcSlippage = (newTokenReserve, newCurrencyReserve) => {
    let newPrices = getPrices([newCurrencyReserve, newTokenReserve])

    if (newPrices.currency.isNaN()) newPrices.currency = toBigNumber("0.0")
    if (newPrices.token.isNaN()) newPrices.token = toBigNumber("0.0")

    return {
      newPrices,
      tokenSlippage: prices.token.dividedBy(newPrices.token).minus(1).multipliedBy(100).absoluteValue(),
      currencySlippage: prices.currency.dividedBy(newPrices.currency).minus(1).multipliedBy(100).absoluteValue()
    }
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

