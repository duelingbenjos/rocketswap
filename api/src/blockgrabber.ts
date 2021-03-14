import mongoose_models from "./mongoose.models";
import { handleNewBlock } from "./types/misc.types";

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
var reloadAPI = false;
if (typeof process.env.RE_LOAD_API !== "undefined") {
	if (process.env.RE_LOAD_API === "yes") reloadAPI = true;
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
	let batchAmount = 25;
	let timerId;

	const wipeDB = async (force = false) => {
		console.log("-----WIPING DATABASE-----");
		if (wipeOnStartup || force){
			await db.models.Blocks.deleteMany({}).then((res) => console.log(res));
			console.log("Blocks DB wiped");
		}
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
		currBlockNum = parseInt(process.env.currBlockNum) || 4000;

		console.log("Set currBlockNum = 0");
		timerId = setTimeout(checkForBlocks, 500);
	};

	const sendBlockRequest = (url) => {
		return new Promise((resolve) => {
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
							// console.log(data);
							resolve(JSON.parse(data));
						} catch (err) {
							console.error("Error: " + err);
							resolve({ error: err.message });
						}
					});
				})
				.on("error", (err) => {
					console.error("Error: " + err.message);
					resolve({ error: err.message });
				});
		});
	};

	const processBlock = async (blockInfo) => {
		if (
			typeof blockInfo.error === "undefined" &&
			typeof blockInfo.number !== "undefined"
		) {
			let hasBlockInDB = false
			let blockNum = blockInfo.number.__fixed__ ? parseInt(blockInfo.number.__fixed__) : blockInfo.number;
			let block = await models.Blocks.findOne({blockNum})
			if (!block){
				console.log("Block doesn't exists, adding new BLOCK model")
				block = new models.Blocks({
					rawBlock: JSON.stringify(blockInfo),
					blockNum,
					hash: blockInfo.hash,
					previous: blockInfo.previous,
					numOfSubBlocks: 0,
					numOfTransactions: 0,
					transactions: JSON.stringify([])
				});
			}else{
				hasBlockInDB = true
				console.log("Block already exists, not adding BLOCK model")
			}

			console.log(
				"processing block " + blockNum + " - ",
				block.hash
			);

			let blockTxList = [];
			if (typeof blockInfo.subblocks !== "undefined") {
				blockInfo.subblocks.forEach((sb) => {
					block.numOfSubBlocks = block.numOfSubBlocks + 1;
					let subblockTxList = [];
					let subblock = new models.Subblocks({
						blockNum,
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
							blockNum,
							subBlockNum: sb.subblock,
							signature: sig.signature,
							signer: sig.signer
						}).save();
					});
					// console.log(sb.transactions);
					(async function loop() {
						for (let tx of sb.transactions) {
							sb.numOfTransactions = sb.numOfTransactions + 1;
							block.numOfTransactions =
								block.numOfTransactions + 1;
							blockTxList.push(tx.hash);
							subblockTxList.push(tx.hash);
							// console.log('METADATA', tx.transaction.metadata)
							await handleNewBlock({
								state: tx.state,
								fn: tx.transaction.payload.function,
								contract: tx.transaction.payload.contract,
								timestamp: tx.transaction.metadata.timestamp,
								hash: tx.hash
							});
						}
					})();
					subblock.transactions = JSON.stringify(subblockTxList);
					subblock.save();
				});
			}
			block.transactions = JSON.stringify(blockTxList);
			block.save(function(err) {
				if (err) console.log(err);
				console.log("saved " + blockNum);
			});
			if (blockNum === currBatchMax) {
				currBlockNum = currBatchMax;
				timerId = setTimeout(checkForBlocks, 100);
			}
		}
	};

	const getBlock_MN = (blockNum, timedelay = 0) => {
		return new Promise(resolver => {
			setTimeout(async () => {
				const block_res = await sendBlockRequest(`${MASTERNODE_URL}${route_getBlockNum}${blockNum}`);
				resolver(block_res);
			}, timedelay)
		})
	};

	const getLatestBlock_MN = () => {
		return new Promise((resolve, reject) => {
			const returnRes = async (res) => {
				resolve(res);
			};

			const res = sendBlockRequest(
				`${MASTERNODE_URL}${route_getLastestBlock}`
			);
			returnRes(res);
		});
	};

	const checkForBlocks = async () => {
		console.log("checking")
		let response = await getLatestBlock_MN();
		
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		if (!response.error) {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			lastestBlockNum = response.number;
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			if (lastestBlockNum.__fixed__) lastestBlockNum = parseInt(lastestBlockNum.__fixed__)
			if (lastestBlockNum < currBlockNum || wipeOnStartup || reloadAPI) {
				await wipeDB();
				wipeOnStartup = false;
				reloadAPI = false;
			} else {
				// console.log("lastestBlockNum: " + lastestBlockNum);
				// console.log("currBlockNum: " + currBlockNum);
				if (lastestBlockNum === currBlockNum) {
					if (alreadyCheckedCount < maxCheckCount)
						alreadyCheckedCount = alreadyCheckedCount + 1;
					checkNextIn = 200 * alreadyCheckedCount;
					timerId = setTimeout(checkForBlocks, checkNextIn);
				}

				let to_fetch = [];
				if (lastestBlockNum > currBlockNum) {
					currBatchMax = currBlockNum + batchAmount;
					if (currBatchMax > lastestBlockNum)
						currBatchMax = lastestBlockNum;
					if (currBatchMax > batchAmount) currBatchMax + batchAmount;
					// let to_process = []
					let blocksToGetCount = 1
					for (let i = currBlockNum + 1; i <= currBatchMax; i++) {
						let blockInfo = await models.Blocks.findOne({blockNum: i})
						let blockData = null;
						if(blockInfo) {
							blockData = JSON.parse(blockInfo.rawBlock)
						}else{
							const timedelay = blocksToGetCount * 500;
							console.log(
								"getting block: " +
									i +
									" with delay of " +
									timedelay +
									"ms"
							);	
							blockData = getBlock_MN(i, timedelay)
							blocksToGetCount = blocksToGetCount + 1
						}
						to_fetch.push(blockData);
					}

					let to_process = await Promise.all(to_fetch);
					to_process.sort((a, b) => a.number - b.number);
					for (let block of to_process) await processBlock(block);
				}

				if (lastestBlockNum < currBlockNum) {
					await wipeDB(true);
					timerId = setTimeout(checkForBlocks, 10000);
				}
			}
		} else {
			/*
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
