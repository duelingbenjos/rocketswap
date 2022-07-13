import staking_contracts from "./staking_contracts.json";

let data = staking_contracts as any;

const first = data.staking_contracts[0];

// const contract_name = first.contract_name;
// const state = first.state;

console.log(Object.keys(first));
console.log(first.meta)