//Change there for for PROD
const DOMAIN_NAME = 'http://localhost:3003'
const CURRENCY_SYMBOL = 'DTAU'
const CURRENCY_NAME = 'Lamden Testnet Token'
const AMM_CONTRACT_NAME = 'con_amm_v9'
const AMM_TOKEN_CONTRACT = 'con_rswp_lst001'
const AMM_TOKEN_SYMBOL = 'RSWP'
const AMM_TOKEN_STAKING_CONTRACT = 'con_staking_smart_epoch_rswp_rswp_02'
// const AMM_TOKEN_STAKING_CONTRACT = 'con_simple_staking_rswp'
const AMM_FEE = '0.003'
const AMM_TOKEN_DISCOUNT = '0.75'
const NAMES_CONTRACT = 'con_ipseity_5'
const BLOCKEXPLORER_URL = 'https://testnet.lamden.io'
const MASTERNODE_URL = 'https://testnet-master-1.lamden.io'
const DOCS_SUBDOMAIN = 'docs'
const GENERIC_ICON = "PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiM0MjAwNjciPjwvcmVjdD48ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSg1MCA1MCkgc2NhbGUoMC42OSAwLjY5KSByb3RhdGUoMCkgdHJhbnNsYXRlKC01MCAtNTApIiBzdHlsZT0iZmlsbDojYmM1OGZmIj48c3ZnIGZpbGw9IiNiYzU4ZmYiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHhtbDpzcGFjZT0icHJlc2VydmUiIHZlcnNpb249IjEuMSIgc3R5bGU9InNoYXBlLXJlbmRlcmluZzpnZW9tZXRyaWNQcmVjaXNpb247dGV4dC1yZW5kZXJpbmc6Z2VvbWV0cmljUHJlY2lzaW9uO2ltYWdlLXJlbmRlcmluZzpvcHRpbWl6ZVF1YWxpdHk7IiB2aWV3Qm94PSIwIDAgODIxIDgyMSIgeD0iMHB4IiB5PSIwcHgiIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIj48ZGVmcz48c3R5bGUgdHlwZT0idGV4dC9jc3MiPgogICAKICAgIC5maWwwIHtmaWxsOiNiYzU4ZmZ9CiAgIAogIDwvc3R5bGU+PC9kZWZzPjxnPjxwYXRoIGNsYXNzPSJmaWwwIiBkPSJNNDExIDBjMjI2LDAgNDEwLDE4NCA0MTAsNDExIDAsMjI2IC0xODQsNDEwIC00MTAsNDEwIC0yMjcsMCAtNDExLC0xODQgLTQxMSwtNDEwIDAsLTIyNyAxODQsLTQxMSA0MTEsLTQxMXptMCA4Nmw4MCAyNDggMjYxIDAgLTIxMSAxNTMgODAgMjQ4IC0yMTAgLTE1NCAtMjExIDE1NCA4MSAtMjQ4IC0yMTIgLTE1MyAyNjEgMCA4MSAtMjQ4em0wIDg3bDAgLTEgLTYyIDE5MCAtMTk5IC0xIDE2MSAxMTcgLTYyIDE5MCAxNjIgLTExOCAwIC0zNzd6Ij48L3BhdGg+PC9nPjwvc3ZnPjwvZz48L3N2Zz4="

export const contract_blacklist = [
  //"con_staking_rswp_doug"
]

export const connectionRequest = {
  appName: 'RocketSwap',
  version: '9.0.0', //Change for PROD
  logo: 'assets/images/RS_Logo.png',
  background: 'assets/images/background.jpeg',
  contractName: AMM_CONTRACT_NAME, //Change for PROD
  networkType: 'testnet' //Change for PROD
}

export const stamps = {
  defaultValue: 50,
  create_market: 120,
  create_liquidity: 85,
  add_liquidity: 85,
  remove_liquidity: 80,
  addStakingTokens: 120,
  withdrawTokensAndYield: 150,
  withdrawYield: 150,
  stake: 200,
  buy: 105,
  auth: 35,
  approve: 30,
  buffer: 40,
  currentRatio: 13 //Change for PROD
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
  docs_subdomain: DOCS_SUBDOMAIN,
  masternode: MASTERNODE_URL //Change for PROD
}

export const currencyToken = {
  contract_name: 'currency',
  token_name: CURRENCY_NAME,
  token_symbol: CURRENCY_SYMBOL
}

export const site_head_meta = {
  siteLogo: `${DOMAIN_NAME}/assets/images/RS_Logo_192.png`,
  imageBig: `${DOMAIN_NAME}/assets/images/rocketswap_card.jpeg`
}

export const walletDownloadURL = 'https://chrome.google.com/webstore/detail/lamden-wallet-browser-ext/fhfffofbcgbjjojdnpcfompojdjjhdim'

export const genericIcon_base64_svg = GENERIC_ICON

export const ammStakingValues = {
  log_accuracy: 1000000000,
  multiplier: 0.07,
  discount_floor: 0.505
}

export const getBaseUrl = (): string => {
  return `${window.location.protocol}//${window.location.hostname}:2053`
}