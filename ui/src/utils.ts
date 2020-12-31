import Lamden from 'lamden-js'
import { config } from './config'

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
  try{
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
    if (v.includes('.')) return true
    return false
  }
  if (isDecmailString(value)) {
    return removeZeros(value)
  } else {
    return value
  }
}

export const calcRatios = (reserves) => {
  if (!reserves) return
  let currencyAmount = Lamden.Encoder.BigNumber(reserves[0])
  let tokenAmount = Lamden.Encoder.BigNumber(reserves[0])
  return {
    'currency': currencyAmount.dividedBy(tokenAmount),
    'token': tokenAmount.dividedBy(currencyAmount)
  }
}

export const toBigNumber = (value) => Lamden.Encoder.BigNumber(value)

export const isBigNumber = (value) => Lamden.Encoder.BigNumber.isBigNumber(value)