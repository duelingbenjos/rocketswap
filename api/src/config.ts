export const config = {
	appName: "Rocketswap",
	contractName: process.env.CONTRACT_NAME || "con_rocketswap_official_v1_1",
	identityContract: process.env.IDENTITY_CONTRACT || "con_rocket_id_v1",
	buy: 150,
	currencySymbol: process.env.CURRENCY_SYMBOL || "TAU",
	blockExplorer: process.env.BLOCK_EXPLORER_URL || "https://mainnet.lamden.io/api",
	masternode: process.env.MASTERNODE_URL || "https://masternode-01.lamden.io",
	networkType: process.env.NETWORK_TYPE || "mainnet", // or 'mainnet'
	staking_contract_submittor: "7c296eb80e379171f694a3c5be7640d16f300f09d731c99ac0a92f49c9c0c151"
};
