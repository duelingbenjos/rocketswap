//Change there for for PROD
const DOMAIN_NAME = "https://rocketswap.exchange"
const CURRENCY_SYMBOL = "TAU"
const CURRENCY_NAME = "Lamden Token"
const AMM_CONTRACT_NAME = 'con_rocketswap_official_v1_1'
const AMM_TOKEN_CONTRACT = "con_rswp_lst001"
const AMM_TOKEN_SYMBOL = "RSWP"
const AMM_TOKEN_STAKING_CONTRACT = "con_simple_staking_tau_rswp_001"
const AMM_FEE = "0.005"
const AMM_TOKEN_DISCOUNT = '0.75'
const NAMES_CONTRACT= "con_rocket_id_v1"
const BLOCKEXPLORER_URL = "https://mainnet.lamden.io"
const MASTERNODE_URL = "https://masternode-01.lamden.io"
const GENERIC_ICON = "PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiM0MjAwNjciPjwvcmVjdD48ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSg1MCA1MCkgc2NhbGUoMC42OSAwLjY5KSByb3RhdGUoMCkgdHJhbnNsYXRlKC01MCAtNTApIiBzdHlsZT0iZmlsbDojYjAzM2ZmIj48c3ZnIGZpbGw9IiNiMDMzZmYiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHZlcnNpb249IjEuMSIgeD0iMHB4IiB5PSIwcHgiIHZpZXdCb3g9IjAgMCA2MCA2MCIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgNjAgNjA7IiB4bWw6c3BhY2U9InByZXNlcnZlIj48cGF0aCBkPSJNMzAuMDA0NjM4NywxMS45OTkwMjM0Yy05LjkyNDgwNDcsMC0xOCw4LjA3NTE5NTMtMTgsMThzOC4wNzUxOTUzLDE4LDE4LDE4czE4LTguMDc1MTk1MywxOC0xOCAgUzM5LjkyOTQ0MzQsMTEuOTk5MDIzNCwzMC4wMDQ2Mzg3LDExLjk5OTAyMzR6IE00MS4xMDMyMTA0LDI3LjQ3MDA5MjhsLTQuOTM3MTMzOCw0LjgxMTc2NzZsMS4xNjU4MzI1LDYuNzk0MzExNSAgYzAuMDU0NDQzNCwwLjMxNjgzMzUtMC4wNzU5Mjc3LDAuNjM2OTYyOS0wLjMzNTgxNTQsMC44MjU5Mjc3Yy0wLjE0Njg1MDYsMC4xMDcyMzg4LTAuMzIxNzc3MywwLjE2MTY4MjEtMC40OTY3MDQxLDAuMTYxNjgyMSAgYy0wLjEzNDQ2MDQsMC0wLjI2OTc3NTQtMC4wMzIxNjU1LTAuMzkyNzAwMi0wLjA5NzM1MTFsLTYuMTAyMTExOC0zLjIwNjk3MDJsLTYuMTAyMTExOCwzLjIwNjk3MDIgIGMtMC4yODIyMjY2LDAuMTUwMTQ2NS0wLjYyNzg2ODcsMC4xMjU0MjcyLTAuODg5NDY1My0wLjA2NDMzMTFjLTAuMjU5ODg3Ny0wLjE4ODk2NDgtMC4zOTAyNTg4LTAuNTA5MDk0Mi0wLjMzNTc1NDQtMC44MjU5Mjc3ICBsMS4xNjQ5NzgtNi43OTQzMTE1bC00LjkzNzEzMzgtNC44MTE3Njc2Yy0wLjIzMDIyNDYtMC4yMjQ0MjYzLTAuMzEyNzQ0MS0wLjU2MDE4MDctMC4yMTM3NDUxLTAuODY1NDc4NSAgYzAuMDk5ODUzNS0wLjMwNjA5MTMsMC4zNjM4OTE2LTAuNTI4ODY5NiwwLjY4MjM3My0wLjU3NTA3MzJsNi44MjIzODc3LTAuOTkxNjk5MmwzLjA1MTAyNTQtNi4xODIxMjg5ICBjMC4yODM4NzQ1LTAuNTc3NTc1NywxLjIzMTAxODEtMC41Nzc1NzU3LDEuNTE0ODMxNSwwbDMuMDUxMDg2NCw2LjE4MjEyODlsNi44MjE1MzMyLDAuOTkxNjk5MiAgYzAuMzE4NDgxNCwwLjA0NjIwMzYsMC41ODI1MTk1LDAuMjY4OTgxOSwwLjY4MjM3MywwLjU3NTA3MzJDNDEuNDE1OTU0NiwyNi45MDk5MTIxLDQxLjMzMzQzNTEsMjcuMjQ1NjY2NSw0MS4xMDMyMTA0LDI3LjQ3MDA5Mjh6Ij48L3BhdGg+PHBhdGggZD0iTTMwLDZDMTYuNzcwMDE5NSw2LDYsMTYuNzY5OTU4NSw2LDMwYzAsMTMuMjI5OTgwNSwxMC43NzAwMTk1LDI0LDI0LDI0YzEzLjI0MDA1MTMsMCwyNC0xMC43NzAwMTk1LDI0LTI0ICBDNTQsMTYuNzY5OTU4NSw0My4yNDAwNTEzLDYsMzAsNnogTTMwLjAwNDYzODcsNDkuOTk5MDIzNGMtMTEuMDI4MzIwMywwLTIwLTguOTcxNjc5Ny0yMC0yMHM4Ljk3MTY3OTctMjAsMjAtMjBzMjAsOC45NzE2Nzk3LDIwLDIwICBTNDEuMDMyOTU5LDQ5Ljk5OTAyMzQsMzAuMDA0NjM4Nyw0OS45OTkwMjM0eiI+PC9wYXRoPjwvc3ZnPjwvZz48L3N2Zz4="

export const contract_blacklist = [
  //"con_staking_rswp_doug"
]

export const connectionRequest = {
  appName: 'RocketSwap',
  version: '1.0.1', //Change for PROD
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
  addStakingTokens: 110,
  withdrawTokensAndYield: 110,
  withdrawYield: 150,
  stake: 80,
  buy: 95,
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

export const getBaseUrl = (): string => {
  return `${window.location.protocol}//${window.location.hostname}:2053`
}