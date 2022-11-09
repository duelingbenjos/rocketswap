import axios, { AxiosResponse } from "axios";

async function getBalances(): Promise<any> {
	const res: any = await axios.get(`http://155.138.240.209:3535/current/all/con_rswp_lst001/balances`);
	return res.data;
}

function getBalanceValue(account: any) {
	const self_value = account.__hash_self__;
	const fixed_value = account.__fixed__;

	if (typeof account === "number") {
		return account.toString();
	}
	if (fixed_value) {
		return fixed_value;
	}
	if (self_value) {
		return Number(self_value) > 0 ? self_value : self_value.__fixed__ ? self_value.__fixed__ : 0;
	} else {
		return self_value;
	}
}

function getObjNumberValue(obj: any) {
	const keys = Object.keys(obj);
	return Number(obj[keys[0]]);
}

async function main() {
	try {
		let response = await getBalances();
		const balances = response.con_rswp_lst001.balances;
		let processed = Object.keys(balances).map((account: any) => {
			return { [account]: getBalanceValue(balances[account]) };
		});
		console.log({processed});

		// const real_wallets = processed.filter((balance) => {
		// 	return Object.keys(balance)[0].length === 64;
		// });
		// const sorted_wallets = real_wallets.sort((a: any, b: any) => {
		// 	const key_a = Object.keys(a)[0];
		// 	const key_b = Object.keys(b)[0];

		// 	return b[key_b] - a[key_a];
		// });
		// const custodian_wallet = sorted_wallets[0];
		// const total_balance_in_wallets = real_wallets.reduce((prev: any, current: any) => {
		// 	// console.log(current);
		// 	const key = Object.keys(current)[0];
		// 	prev += Number(current[key]);
		// 	return prev;
		// }, 0);
		// let circ_balance = total_balance_in_wallets - getObjNumberValue(custodian_wallet);
		// const staked = [12595281.93026625, 84734.37893056, 297110.31334306, 13876034.908054975820929504156299216662]
		// staked.forEach(value => circ_balance += value)
		// console.log(circ_balance);
	} catch (err) {
		console.error(err);
	}
}

Promise.resolve(main());
