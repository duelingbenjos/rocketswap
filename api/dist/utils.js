"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getContractCode = exports.getContractEntry = exports.getContractName = exports.getVal = exports.getKey = exports.validateTokenContract = exports.getNewJoiner = exports.isLamdenKey = void 0;
const bignumber_js_1 = require("bignumber.js");
const validators = require("types-validate-assert");
const { validateTypes } = validators;
exports.isLamdenKey = (key) => {
    if (validateTypes.isStringHex(key) && key.length === 64)
        return true;
    return false;
};
exports.getNewJoiner = (state, prev_state) => {
    const { players } = state;
    const prev_players = prev_state.players;
    const new_joiner = players.reduce((accum, val) => {
        if (val.indexOf(prev_players) < 0)
            accum = val;
    }, "");
    return new_joiner;
};
function validateTokenContract(contract) {
    const required_fields = [
        "def transfer",
        "def balance_of",
        "def allowance",
        "def approve",
        "def transfer_from",
        "token_name = Variable",
        "token_symbol = Variable"
    ];
    let missing = required_fields.map((field) => contract.includes(field));
    let missing_idx = missing.findIndex((field) => field === false);
    return missing_idx > -1 ? false : true;
}
exports.validateTokenContract = validateTokenContract;
function getKey(state, idx_1, idx_2) {
    return state[idx_1].key.split(":")[idx_2];
}
exports.getKey = getKey;
function getVal(state, idx) {
    var _a, _b;
    let val;
    if (idx) {
        val = (_a = state[idx]) === null || _a === void 0 ? void 0 : _a.value;
    }
    else {
        val = (_b = state) === null || _b === void 0 ? void 0 : _b.value;
    }
    val = new bignumber_js_1.default((val === null || val === void 0 ? void 0 : val.__fixed__) || val);
    if (val.isNaN())
        return "0";
    return val.toString();
}
exports.getVal = getVal;
function getContractName(state) {
    let code_entry = getContractEntry(state);
    if (code_entry) {
        let code_key = code_entry.key;
        let contract_name = code_key.split(".")[0];
        return contract_name;
    }
    return "";
}
exports.getContractName = getContractName;
function getContractEntry(state) {
    let code_entry = state.filter((kvp) => {
        return kvp.key.includes("__code__");
    })[0];
    return code_entry;
}
exports.getContractEntry = getContractEntry;
function getContractCode(state) {
    let entry = getContractEntry(state);
    return entry ? entry.value : "";
}
exports.getContractCode = getContractCode;
//# sourceMappingURL=utils.js.map