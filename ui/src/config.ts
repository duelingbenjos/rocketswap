//Change there for for PROD

const CURRENCY_SYMBOL = "DTAU"
const AMM_TOKEN_SYMBOL = "RSWP"
const NAMES_CONTRACT= "con_ipseity_5"
const BLOCKEXPLORER_URL = "https://testnet.lamden.io"
const MASTERNODE_URL = "https://testnet-master-1.lamden.io"
const GENERIC_ICON = "PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiPjxjaXJjbGUgc3Ryb2tlPSJub25lIiBmaWxsPSIjOGU3Yjk4IiByPSI0OCUiIGN4PSI1MCUiIGN5PSI1MCUiPjwvY2lyY2xlPjxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDUwIDUwKSBzY2FsZSgwLjY5IDAuNjkpIHJvdGF0ZSgwKSB0cmFuc2xhdGUoLTUwIC01MCkiIHN0eWxlPSJmaWxsOiNmZmZmZmYiPjxzdmcgZmlsbD0iI2ZmZmZmZiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSIgdmVyc2lvbj0iMS4xIiBzdHlsZT0ic2hhcGUtcmVuZGVyaW5nOmdlb21ldHJpY1ByZWNpc2lvbjt0ZXh0LXJlbmRlcmluZzpnZW9tZXRyaWNQcmVjaXNpb247aW1hZ2UtcmVuZGVyaW5nOm9wdGltaXplUXVhbGl0eTsiIHZpZXdCb3g9IjAgMCA1OCA4OCIgeD0iMHB4IiB5PSIwcHgiIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIj48ZGVmcz48c3R5bGUgdHlwZT0idGV4dC9jc3MiPgogICAKICAgIC5maWwwIHtmaWxsOiNmZmZmZmZ9CiAgIAogIDwvc3R5bGU+PC9kZWZzPjxnPjxwYXRoIGNsYXNzPSJmaWwwIiBkPSJNMCAyNGMwLC0zMSA1OCwtMzMgNTgsLTEgMCwxOSAtMTksMTggLTIzLDM2IC0yLDkgLTE0LDggLTE0LC0yIDAsLTE3IDE0LC0xOCAyMCwtMjkgNCwtOCAtMywtMTYgLTExLC0xNiAtMTcsMCAtMTEsMTkgLTIyLDE5IC00LDAgLTgsLTMgLTgsLTd6bTI4IDY0Yy0xMiwwIC0xMSwtMTggMCwtMTggMTIsMCAxMiwxOCAwLDE4eiI+PC9wYXRoPjwvZz48L3N2Zz48L2c+PC9zdmc+"

export const connectionRequest = {
  appName: 'RocketSwap',
  version: '6.0.0', //Change for PROD
  logo: 'assets/images/RS_Logo.png',
  background: 'assets/images/background.jpeg',
  contractName: 'con_amm_v6', //Change for PROD
  networkType: 'testnet'  //Change for PROD
}

export const stamps = {
  defaultValue: 50,
  create_market: 110,
  add_liquidity: 85,
  remove_liquidity: 80,
  buy: 200,
  auth: 35,
  approve: 30,
  buffer: 10,
  currentRatio: 13 //Change for PROD
}

export const config = {
  namesContract: NAMES_CONTRACT, //Change for PROD
  currencySymbol: CURRENCY_SYMBOL, //Change for PROD
  ammTokenSymbol: AMM_TOKEN_SYMBOL, //Change for PROD
  blockExplorer: BLOCKEXPLORER_URL, //Change for PROD
  masternode: MASTERNODE_URL, //Change for PROD
}

export const walletDownloadURL = "https://chrome.google.com/webstore/detail/lamden-wallet-browser-ext/fhfffofbcgbjjojdnpcfompojdjjhdim"

export const genericIcon_base64_svg = GENERIC_ICON
