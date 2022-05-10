export const config_testnet: IApiConfig = {
	app_name: "Rocketswap",
	amm_contract: process.env.CONTRACT_NAME || "con_amm_v9",
	identity_contract: process.env.IDENTITY_CONTRACT || "con_ipseity_5",
	buy: 150,
	currency_symbol: process.env.CURRENCY_SYMBOL || "dTAU",
	block_explorer: process.env.BLOCK_EXPLORER_URL || "https://testnet.lamden.io/api",
	masternode: process.env.MASTERNODE_URL || "https://testnet-master-1.lamden.io",
	network_type: process.env.NETWORK_TYPE || "testnet", // or 'mainnet'
	staking_contract_submittor: "7c296eb80e379171f694a3c5be7640d16f300f09d731c99ac0a92f49c9c0c151",
	block_service_urls: process.env.block_service_urls?.split(",") || ["165.227.181.34:3535"]
};

export const config_prod: IApiConfig = {
	app_name: "Rocketswap",
	amm_contract: process.env.CONTRACT_NAME || "con_rocketswap_official_v1_1",
	identity_contract: process.env.IDENTITY_CONTRACT || "con_rocket_id_v1",
	buy: 150,
	currency_symbol: process.env.CURRENCY_SYMBOL || "TAU",
	block_explorer: process.env.BLOCK_EXPLORER_URL || "https://mainnet.lamden.io/api",
	masternode: process.env.MASTERNODE_URL || "https://masternode-01.lamden.io",
	network_type: process.env.NETWORK_TYPE || "mainnet",
	staking_contract_submittor: "7c296eb80e379171f694a3c5be7640d16f300f09d731c99ac0a92f49c9c0c151",
	block_service_urls: process.env.block_service_urls?.split(",") || ["<BLOCK_SERVICE_IP HERE>"]
};

export const getConfig = () => (process.env.NETWORK_TYPE === "testnet" ? config_testnet : config_prod);

export let config = getConfig();

interface IApiConfig {
	app_name: string;
	amm_contract: string;
	identity_contract: string;
	buy: number;
	currency_symbol: string;
	block_explorer: string;
	masternode: string;
	network_type: string;
	staking_contract_submittor: string;
	block_service_urls: string[];
}

export const isTestnet = () => {
	return config.network_type === "testnet" ? true : false;
};
