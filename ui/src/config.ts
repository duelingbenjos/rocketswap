// {
// 	// infoContract: "con_pixel_frames",
// 	master_contract: "con_ac2c_master_05",
// 	currency_symbol: "dTau",
// 	// domainName: "https://demoapp.lamden.io",
// 	//blockExplorer: "http://localhost:1337",
// 	block_explorer: "https://testnet.lamden.io/api",
//     masternode: "https://testnet-master-1.lamden.io",
//     network: 'testnet'
// };

const connectionRequest = {
  appName: 'RocketSwap',
  version: '1.0.1',
  logo: 'images/logo.png',
  contractName: 'con_amm2',
  currencySymbol: 'dTAU',
  // domainName: "https://demoapp.lamden.io",
  blockExplorer: 'https://testnet.lamden.io/api',
  masternode: 'https://testnet-master-1.lamden.io',
  networkType: 'testnet' // or 'mainnet'
}

export const config = connectionRequest

///https://testnet-master-1.lamden.io/contracts/${contract}/${variable}/