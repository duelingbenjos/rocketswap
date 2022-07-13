module.exports = {
	apps: [
		{
			name: "ui",
			script: "cd ./ui && npm run prod",
		},
		{
			name: "api",
			script: "cd ./api && npm run start",
			env: {
				MASTERNODE_URL: "https://masternode-01.lamden.io",
				CONTRACT_NAME: "con_rocketswap_official_v1_1",
				IDENTITY_CONTRACT: "con_rocket_id_v1",
				CURRENCY_SYMBOL: "TAU",
				SECRET: "DEPRECATED",
				NETWORK_TYPE: "mainnet",
				CONTEXT: "remote"
			}
		},
		{
			name: "docs",
			script: "cd ./docs && npm run serve:ssr"
		},
		{
			name: "proxy",
			script: "cd ./proxy_server && npm run start",
		}
	]
};
