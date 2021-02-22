import mongoose_models from "./mongoose.models";
import {handleNewBlock} from './types/misc.types'

const https = require("https");
const http = require("http");
const mongoose = require("mongoose");

let db = mongoose;
const MASTERNODE_URL = "https://testnet-master-1.lamden.io";

/******* MONGO DB CONNECTION INFO **/
const DBUSER = process.env.ROCKETSWAP_DB_USERNAME;
const DBPWD = process.env.ROCKETSWAP_DB_PASSWORD;
//console.log(DBUSER, DBPWD);
let connectionString = `mongodb://127.0.0.1:27017/block-explorer`;

if (DBUSER) {
	connectionString = `mongodb://${DBUSER}:${DBPWD}@${process.env.ROCKETSWAP_DB_HOST}/block-explorer?authSource=admin`;
}

var wipeOnStartup = false;
if (typeof process.env.WIPE !== "undefined") {
	if (process.env.WIPE === "yes") wipeOnStartup = true;
}

const databaseLoader = (models, handleNewBlock: handleNewBlock) => {
	let currBlockNum = 1;
	let checkNextIn = 0;
	let maxCheckCount = 10;
	let alreadyCheckedCount = 0;
	const route_getBlockNum = "/blocks?num=";
	const route_getLastestBlock = "/latest_block";
	let lastestBlockNum = 0;
	let currBatchMax = 0;
	let batchAmount = 20;
	let timerId;

	const wipeDB = async () => {
		console.log("-----WIPING DATABASE-----");
		await db.models.Blocks.deleteMany({}).then((res) => console.log(res));
		console.log("Blocks DB wiped");
		await db.models.Subblocks.deleteMany({}).then((res) =>
			console.log(res)
		);
		console.log("Subblocks DB wiped");
		await db.models.SubblockSigs.deleteMany({}).then((res) =>
			console.log(res)
		);
		console.log("SubblockSigs DB wiped");
		await db.models.State.deleteMany({}).then((res) => console.log(res));
		console.log("State DB wiped");
		await db.models.Transactions.deleteMany({}).then((res) =>
			console.log(res)
		);
		console.log("Transactions DB wiped");

		/*
		NO TOKEN CONTRACTS EXIST BELOW BLOCK 2345

		TODO:
			IF Testnet is reset or for production change this value
		*/
		currBlockNum = 2345;
		//currBlockNum = 3660;
		//currBlockNum = 3500;

		console.log("Set currBlockNum = 0");
		timerId = setTimeout(checkForBlocks, 1000);
	};

	const sendBlockRequest =  (url) => {
		return new Promise((resolve)=>{
			let protocol = http;
			if (url.includes("https://")) protocol = https;
			protocol
				.get(url, (resp) => {
					let data = "";
					resp.on("data", (chunk) => {
						data += chunk;
					});
					resp.on("end", () => {
						try {
							resolve(JSON.parse(data))
						} catch (err) {
							console.error("Error: " + err.message);
							resolve(({error: err.message}))
						}
					});
				})
				.on("error", (err) => {
					console.error("Error: " + err.message);
					resolve({error: err.message})
				});
		})
	};

	const processBlock = async (blockInfo) => {
		if (
			typeof blockInfo.error === "undefined" &&
			typeof blockInfo.number !== "undefined"
		) {
			let block = new models.Blocks({
				rawBlock: JSON.stringify(blockInfo),
				blockNum: blockInfo.number,
				hash: blockInfo.hash,
				previous: blockInfo.previous,
				numOfSubBlocks: 0,
				numOfTransactions: 0,
				transactions: JSON.stringify([])
			});
			
			console.log(
				"processing block " + blockInfo.number + " - ",
				block.hash
			);
			
			let blockTxList = [];
			if (typeof blockInfo.subblocks !== "undefined") {
				blockInfo.subblocks.forEach((sb) => {
					block.numOfSubBlocks = block.numOfSubBlocks + 1;
					let subblockTxList = [];
					let subblock = new models.Subblocks({
						blockNum: blockInfo.number,
						inputHash: sb.input_hash,
						merkleLeaves: JSON.stringify(sb.merkle_leaves),
						prevBlockHash: sb.previous,
						signatures: JSON.stringify(sb.signatures),
						subBlockNum: sb.subblock,
						numOfTransactions: 0,
						transactions: JSON.stringify([])
					});

					sb.signatures.forEach((sig) => {
						new models.SubblockSigs({
							blockNum: blockInfo.number,
							subBlockNum: sb.subblock,
							signature: sig.signature,
							signer: sig.signer
						}).save();
					});
					// console.log(sb.transactions);
					(async function loop() {for (let tx of sb.transactions) {
						sb.numOfTransactions = sb.numOfTransactions + 1;
						block.numOfTransactions = block.numOfTransactions + 1;
						blockTxList.push(tx.hash);
						subblockTxList.push(tx.hash);
					await handleNewBlock({
							state: tx.state,
							fn: tx.transaction.payload.function,
							contract: tx.transaction.payload.contract,
							timestamp: tx.transaction.metadata.timestamp
						});

					}})()
					subblock.transactions = JSON.stringify(subblockTxList);
					subblock.save();
				});
			}
			block.transactions = JSON.stringify(blockTxList);
			block.save(function(err) {
				if (err) console.log(err);
				console.log("saved " + blockInfo.number);
			});
			if (blockInfo.number === currBatchMax) {
				currBlockNum = currBatchMax;
				timerId = setTimeout(checkForBlocks, 0);
			}
		}
	};

	const getBlock_MN = async (blockNum) => {
		const block_res = await sendBlockRequest(`${MASTERNODE_URL}${route_getBlockNum}${blockNum}`);
		return block_res
};

	const getLatestBlock_MN = () => {
		return new Promise((resolve, reject) => {
			const returnRes = async (res) => {
				resolve(res);
			};
			 
			const res = sendBlockRequest(`${MASTERNODE_URL}${route_getLastestBlock}`);
			returnRes(res)
		});
	};

	const checkForBlocks = async () => {
		let response: any = await getLatestBlock_MN();

		if (!response.error) {
			lastestBlockNum = response.number;
			if (lastestBlockNum < currBlockNum || wipeOnStartup) {
				await wipeDB();
				wipeOnStartup = false;
			} else {
				// console.log("lastestBlockNum: " + lastestBlockNum);
				// console.log("currBlockNum: " + currBlockNum);
				if (lastestBlockNum === currBlockNum) {
					if (alreadyCheckedCount < maxCheckCount)
						alreadyCheckedCount = alreadyCheckedCount + 1;
					checkNextIn = 100 * alreadyCheckedCount;
					timerId = setTimeout(checkForBlocks, checkNextIn);
				}

				if (lastestBlockNum > currBlockNum) {
					currBatchMax = currBlockNum + batchAmount;
					if (currBatchMax > lastestBlockNum)
						currBatchMax = lastestBlockNum;
					if (currBatchMax > batchAmount) currBatchMax + batchAmount;
					// let to_process = []
					let to_fetch = []
					for (let i = currBlockNum + 1; i <= currBatchMax; i++) {
						// let timedelay = (i - currBlockNum) * 100;
						// console.log(
						// 	"getting block: " +
						// 		i +
						// 		" with delay of " +
						// 		timedelay +
						// 		"ms"
						// );
						let block = getBlock_MN(i)
						to_fetch.push(block)
						// }, 200 + timedelay);
					}
					let to_process = await Promise.all(to_fetch)
					// console.log(to_process)
					to_process.sort((a,b) => a.number - b.number)
					for(let block of to_process) {
						await processBlock(block)
					}
				}

				if (lastestBlockNum < currBlockNum) {
					wipeDB();
					timerId = setTimeout(checkForBlocks, 10000);
				}
			}
		} else {/*
			console.log(
				"Could not contact masternode, trying again in 10 seconds"
			);*/
			timerId = setTimeout(checkForBlocks, 10000);
		}
	};

	models.Blocks.findOne()
		.sort({ blockNum: -1 })
		.then(async (res) => {
			if (res) currBlockNum = res.blockNum ? res.blockNum : 0;
			else currBlockNum = 0;
			//console.log("wipeOnStartup", wipeOnStartup);
			timerId = setTimeout(checkForBlocks, 0);
		});
};

export default (handleNewBlock: handleNewBlock) => {
	db.connect(
		connectionString,
		{ useNewUrlParser: true, useUnifiedTopology: true },
		(error) => {
			if (error) console.log(error);
			else {
				//console.log("connection successful");
				databaseLoader(mongoose_models, handleNewBlock);
			}
		}
	);
};
