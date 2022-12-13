module.exports = {
	apps: [
		{
			name: "ui",
			script: "cd ./ui && npm run dev"
		},
		{
			name: "api",
			script: "cd ./api && npm run start:dev:tn2",
			env: {
				NETWORK_TYPE: "testnet",
				CONTEXT: "remote"
			}
		},
		// {
		// 	name: "docs",
		// 	script: "cd ./docs && npm run serve"
		// },
		{
			name: "proxy",
			script: "cd ./proxy_server && npm run start"
		}
	]
};
