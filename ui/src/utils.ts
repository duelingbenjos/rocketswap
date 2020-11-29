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
