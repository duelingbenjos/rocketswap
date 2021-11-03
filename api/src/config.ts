// export const config = {
// 	appName: "Rocketswap",
// 	contractName: process.env.CONTRACT_NAME || "con_amm_v9",
// 	identityContract: process.env.IDENTITY_CONTRACT || "con_ipseity_5",
// 	buy: 150,
// 	currencySymbol: process.env.CURRENCY_SYMBOL || "dTau",
// 	blockExplorer: process.env.BLOCK_EXPLORER_URL || "https://testnet.lamden.io/api",
// 	masternode: process.env.MASTERNODE_URL || "https://testnet-master-1.lamden.io",
// 	networkType: process.env.NETWORK_TYPE || "testnet", // or 'mainnet'
// 	staking_contract_submittor: "7c296eb80e379171f694a3c5be7640d16f300f09d731c99ac0a92f49c9c0c151",
// 	block_service_urls: process.env.block_service_urls?.split(',') || ['78.141.225.103:3535'],
// };
export const config = {
	appName: "Rocketswap",
	amm_contract: process.env.CONTRACT_NAME || "con_rocketswap_official_v1_1",
	identityContract: process.env.IDENTITY_CONTRACT || "con_rocket_id_v1",
	buy: 150,
	currencySymbol: process.env.CURRENCY_SYMBOL || "dTau",
	blockExplorer: process.env.BLOCK_EXPLORER_URL || "https://testnet.lamden.io/api",
	masternode: process.env.MASTERNODE_URL || "https://testnet-master-1.lamden.io",
	networkType: process.env.NETWORK_TYPE || "testnet", // or 'mainnet'
	staking_contract_submittor: "7c296eb80e379171f694a3c5be7640d16f300f09d731c99ac0a92f49c9c0c151",
	block_service_urls: process.env.block_service_urls?.split(',') || ['78.141.225.103:3535'],
};
