//Change there for for PROD
const DOMAIN_NAME = "http://45.63.90.114:5000/"
const CURRENCY_SYMBOL = "TAU"
const CURRENCY_NAME = "Lamden Token"
const AMM_CONTRACT_NAME = 'con_rocketswap_official_v1'
const AMM_TOKEN_CONTRACT = "con_rswp_lst001"
const AMM_TOKEN_SYMBOL = "RSWP"
const AMM_TOKEN_STAKING_CONTRACT = "con_staking_dtau_rswp_lst001_4"
const AMM_FEE = "0.005"
const AMM_TOKEN_DISCOUNT = '0.75'
const NAMES_CONTRACT= "con_rocket_id_v1"
const BLOCKEXPLORER_URL = "https://mainnet.lamden.io"
const MASTERNODE_URL = "https://masternode-01.lamden.io"
const GENERIC_ICON = "PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiPjxjaXJjbGUgc3Ryb2tlPSJub25lIiBmaWxsPSIjOGU3Yjk4IiByPSI0OCUiIGN4PSI1MCUiIGN5PSI1MCUiPjwvY2lyY2xlPjxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDUwIDUwKSBzY2FsZSgwLjY5IDAuNjkpIHJvdGF0ZSgwKSB0cmFuc2xhdGUoLTUwIC01MCkiIHN0eWxlPSJmaWxsOiNmZmZmZmYiPjxzdmcgZmlsbD0iI2ZmZmZmZiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSIgdmVyc2lvbj0iMS4xIiBzdHlsZT0ic2hhcGUtcmVuZGVyaW5nOmdlb21ldHJpY1ByZWNpc2lvbjt0ZXh0LXJlbmRlcmluZzpnZW9tZXRyaWNQcmVjaXNpb247aW1hZ2UtcmVuZGVyaW5nOm9wdGltaXplUXVhbGl0eTsiIHZpZXdCb3g9IjAgMCA1OCA4OCIgeD0iMHB4IiB5PSIwcHgiIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIj48ZGVmcz48c3R5bGUgdHlwZT0idGV4dC9jc3MiPgogICAKICAgIC5maWwwIHtmaWxsOiNmZmZmZmZ9CiAgIAogIDwvc3R5bGU+PC9kZWZzPjxnPjxwYXRoIGNsYXNzPSJmaWwwIiBkPSJNMCAyNGMwLC0zMSA1OCwtMzMgNTgsLTEgMCwxOSAtMTksMTggLTIzLDM2IC0yLDkgLTE0LDggLTE0LC0yIDAsLTE3IDE0LC0xOCAyMCwtMjkgNCwtOCAtMywtMTYgLTExLC0xNiAtMTcsMCAtMTEsMTkgLTIyLDE5IC00LDAgLTgsLTMgLTgsLTd6bTI4IDY0Yy0xMiwwIC0xMSwtMTggMCwtMTggMTIsMCAxMiwxOCAwLDE4eiI+PC9wYXRoPjwvZz48L3N2Zz48L2c+PC9zdmc+"

export const contract_blacklist = [
  //"con_staking_rswp_doug"
]

export const connectionRequest = {
  appName: 'RocketSwap',
  version: '1.0.0', //Change for PROD
  logo: 'assets/images/RS_Logo.png',
  background: 'assets/images/background.jpeg',
  contractName: AMM_CONTRACT_NAME, //Change for PROD
  networkType: 'mainnet'  //Change for PROD
}

export const stamps = {
  defaultValue: 50,
  create_market: 110,
  add_liquidity: 85,
  remove_liquidity: 80,
  addStakingTokens: 120,
  withdrawTokensAndYield: 150,
  withdrawYield: 150,
  stake: 200,
  buy: 200,
  auth: 35,
  approve: 30,
  buffer: 30,
  currentRatio: 65 //Change for PROD
}

export const config = {
  domainName: DOMAIN_NAME,
  namesContract: NAMES_CONTRACT, //Change for PROD
  currencySymbol: CURRENCY_SYMBOL, //Change for PROD
  currencyName: CURRENCY_NAME, // Change for PROD
  ammContractName: AMM_CONTRACT_NAME,
  ammTokenSymbol: AMM_TOKEN_SYMBOL, //Change for PROD
  ammTokenContract: AMM_TOKEN_CONTRACT, // Change for PROD
  ammTokenDiscount: AMM_TOKEN_DISCOUNT,
  ammTokenStakingContract: AMM_TOKEN_STAKING_CONTRACT, // Change for PROD
  ammFee: AMM_FEE, //Change for PROD
  blockExplorer: BLOCKEXPLORER_URL, //Change for PROD
  masternode: MASTERNODE_URL, //Change for PROD
}

export const currencyToken = {
  contract_name: "currency",
  token_name: CURRENCY_NAME,
  token_symbol: CURRENCY_SYMBOL
}

export const site_head_meta = {
  siteLogo: `${DOMAIN_NAME}/assets/images/RS_Logo_192.png`,
  imageBig: `${DOMAIN_NAME}/assets/images/rocketswap_card.jpeg`
}

export const walletDownloadURL = "https://chrome.google.com/webstore/detail/lamden-wallet-browser-ext/fhfffofbcgbjjojdnpcfompojdjjhdim"

export const genericIcon_base64_svg = GENERIC_ICON

export const ammStakingValues = {
  log_accuracy: 1000000000,
  multiplier: 0.07,
  discount_floor: 0.505
}


const isConnectionDirect = (): boolean => {
  const res = window.location.hostname.includes('localhost') ||
  window.location.hostname.includes('0.0.0.0') ||
  window.location.hostname.includes('127.0.0.1') ||
  window.location.hostname.includes('45')
  console.log(res)
  return res
}

export const getBaseUrl = (): string => {
  console.log({hostname: window.location.hostname})
  return isConnectionDirect()
    ? `http://${window.location.hostname}:2053`
    : '/cxn'
}

export const ws_options = isConnectionDirect() ? {} : {path: '/cxn/socket.io'}
