import mongoose_models from "./mongoose.models";
import { ParserProvider } from "./parser.provider";
import { handleNewBlock } from "./types/misc.types";
import {log} from './utils/logger'
const https = require("https");
const http = require("http");
const mongoose = require("mongoose");

let db = mongoose;
const MASTERNODE_URL = process.env.MASTERNODE_URL || "https://testnet-master-1.lamden.io";

/******* MONGO DB CONNECTION INFO **/
const DBUSER = process.env.ROCKETSWAP_DB_USERNAME;
const DBPWD = process.env.ROCKETSWAP_DB_PASSWORD;
const NETWORK_TYPE = process.env.NETWORK_TYPE;
//log.log(DBUSER, DBPWD);
let connectionString = `mongodb://127.0.0.1:27017/block-explorer`;

if (DBUSER) {
	connectionString = `mongodb://${DBUSER}:${DBPWD}@${process.env.ROCKETSWAP_DB_HOST}`;
} else if (NETWORK_TYPE === 'mainnet') {
	connectionString = 'mongodb://127.0.0.1/mainnet-blockinfo'
}

var wipeOnStartup = false;
if (typeof process.env.WIPE !== "undefined") {
	if (process.env.WIPE === "yes") wipeOnStartup = true;
}
var reloadAPI = false;
if (typeof process.env.RE_LOAD_API !== "undefined") {
	if (process.env.RE_LOAD_API === "yes") reloadAPI = true;
}

const databaseLoader = (models, handleNewBlock: handleNewBlock, bypass_wipe: boolean, instance_id: string, block_num?: number) => {
	let currBlockNum = 1;
	let checkNextIn = 0;
	let maxCheckCount = 10;
	let alreadyCheckedCount = 0;
	const route_getBlockNum = "/blocks?num=";
	const route_getLastestBlock = "/latest_block";
	let latestBlockNum: any = 0;
	let currBatchMax = 0;
	let batchAmount = 25;
	let timerId;

	const wipeDB = async (force = false) => {
		log.log("-----WIPING DATABASE-----");
		if (wipeOnStartup || force){
			await db.models.Blocks.deleteMany({}).then((res) => log.log(res));
			log.log("Blocks DB wiped");
		}
		await db.models.Subblocks.deleteMany({}).then((res) =>
			log.log(res)
		);
		log.log("Subblocks DB wiped");
		await db.models.SubblockSigs.deleteMany({}).then((res) =>
			log.log(res)
		);
		log.log("SubblockSigs DB wiped");
		await db.models.State.deleteMany({}).then((res) => log.log(res));
		log.log("State DB wiped");
		await db.models.Transactions.deleteMany({}).then((res) =>
			log.log(res)
		);
		log.log("Transactions DB wiped");

		/*
		NO TOKEN CONTRACTS EXIST BELOW BLOCK 2345


		TODO:
			IF Testnet is reset or for production change this value
		*/
		currBlockNum = parseInt(process.env.currBlockNum) || 7000;

		log.log("Set currBlockNum = 0");
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
							// log.log(data);
							resolve(JSON.parse(data));
						} catch (err) {
							log.error("Error: " + err);
							resolve({ error: err.message });
						}
					});
				})
				.on("error", (err) => {
					log.error("Error: " + err.message);
					resolve({ error: err.message });
				});
		});
	};

	const processBlock = async (blockInfo) => {
		const { error } = blockInfo
		if (error) return

		if ( !malformedBlock(blockInfo) ) {

			let blockNum = blockInfo.number;
			let block = await models.Blocks.findOne({blockNum})
			if (!block){
				block = new models.Blocks({
					rawBlock: JSON.stringify(blockInfo),
					blockNum,
					hash: blockInfo.hash,
					previous: blockInfo.previous,
					numOfSubBlocks: 0,
					numOfTransactions: 0,
					transactions: JSON.stringify([])
				});
			}

			log.log(
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
					// log.log(sb.transactions);
					(async function loop() {
						for (let tx of sb.transactions) {
							sb.numOfTransactions = sb.numOfTransactions + 1;
							block.numOfTransactions =
								block.numOfTransactions + 1;
							blockTxList.push(tx.hash);
							subblockTxList.push(tx.hash);
							// log.log('METADATA', tx.transaction.metadata)
							await handleNewBlock({
								state: tx.state,
								fn: tx.transaction.payload.function,
								contract: tx.transaction.payload.contract,
								timestamp: tx.transaction.metadata.timestamp,
								hash: tx.hash,
								block_num: blockNum
							});
						}
					})();
					subblock.transactions = JSON.stringify(subblockTxList);
					subblock.save();
				});
			}
			block.transactions = JSON.stringify(blockTxList);
			block.save(function(err) {
				if (err) log.log(err);
				log.log("saved " + blockNum);
				updateLastChecked()
			});
			currBlockNum = blockNum
			if (blockNum === currBatchMax) {
				// currBlockNum = currBatchMax;
				checkForBlocks()
			}
		}
	};

	const getBlock_MN = (blockNum, timedelay = 0) => {
		return new Promise(resolver => {
			setTimeout(async () => {
				const block_res = await sendBlockRequest(`${MASTERNODE_URL}${route_getBlockNum}${blockNum}`);
				// console.log({url: `${MASTERNODE_URL}${route_getBlockNum}${blockNum}`, block_res})
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

	const blockExists = (blockInfo) => {
		const { error } = blockInfo
		if (error){
			if (error === "Block not found.") return false
		}
		return true
	}

	const malformedBlock = (blockInfo) => {
        const validateValue = (value, name) => {
            if (isNaN(parseInt(value))) throw new Error(`'${name}' has malformed value ${JSON.stringify(value)}`)
        }

        const { number, subblocks } = blockInfo
        try{
			// If the block isn't there then that's okay
			if (blockInfo.error === "Block not found.") return false

            validateValue(number, 'number')
            if (Array.isArray(subblocks)) {
                for (let sb of subblocks){
                    const { transactions, subblock } = sb
                    
                    validateValue(subblock, 'subblock')
                    if (Array.isArray(transactions)) {
                        for (let tx of transactions){
                            const { stamps_used,  status, transaction } = tx
                            const { metadata,  payload } = transaction
                            const { timestamp } = metadata
                            const { nonce, stamps_supplied } = payload
                            validateValue(stamps_used, 'stamps_used')
                            validateValue(status, 'status')
                            validateValue(timestamp, 'timestamp')
                            validateValue(nonce, 'nonce')
                            validateValue(stamps_supplied, 'stamps_supplied')
                        }
                    }
                }
            }
        }catch(e){
            console.log({"Malformed Block": e})
            return true
        }
        return false
    }

	const checkForBlocks = async () => {
		if (instance_id !== ParserProvider.blockgrabber_active_instance_id) return
		updateLastChecked()
		let response: any = await getLatestBlock_MN();

		if (!response.error) {
			latestBlockNum = response.number;
			if (latestBlockNum.__fixed__) latestBlockNum = parseInt(latestBlockNum.__fixed__)
			if ((latestBlockNum < currBlockNum || wipeOnStartup || reloadAPI) && !bypass_wipe) {
				await wipeDB();
				wipeOnStartup = false;
				reloadAPI = false;
			} else {
				// log.log("lastestBlockNum: " + lastestBlockNum);
				// log.log("currBlockNum: " + currBlockNum);
				if (latestBlockNum === currBlockNum) {
					if (alreadyCheckedCount < maxCheckCount)
						alreadyCheckedCount = alreadyCheckedCount + 1;
					checkNextIn = 200 * alreadyCheckedCount;
					timerId = setTimeout(checkForBlocks, checkNextIn);
				}

				let to_fetch = [];
				
				if (latestBlockNum > currBlockNum) {
					currBatchMax = currBlockNum + batchAmount;
					if (currBatchMax > latestBlockNum)
						currBatchMax = latestBlockNum;
					if (currBatchMax > batchAmount) currBatchMax + batchAmount;

					let blocksToGetCount = 1
					for (let i = currBlockNum + 1; i <= currBatchMax; i++) {
						// Get the raw block data from the internal database
						let block = await db.models.Blocks.findOne({ blockNum: i })
                        let blockData = null;
						
						// If there was somethin then check to make sure it is a proper block and not malformed
                        if (block){
							const { rawBlock } = block
							let blockInfo = JSON.parse(rawBlock)
                            if (blockInfo){
								// If it's good then use this block data instead of getting it from the maternode
								if (!malformedBlock(blockInfo)) {
									blockData = blockInfo
								// If it was malformed then delete the bad block from the database. 
								// not setting "blockData" here will make the logic get it from the Masternode below
								}else{
                                    log.log(`Block ${i}: Malformed block in database, deleting it!`)
                                    await db.models.Blocks.deleteOne({ blockNum: i })
                                }
                            }
                        }
						
						// If we didn't get block data from the database (above)
                        if (blockData === null){
							
							// Create time delay to get the block info (to prevernt getting rate limted)
                            const timedelay = blocksToGetCount * 150;
							// Get blockData from the masternode
							// This is a promise that will get awaited below in Promise.all
							blockData = getBlock_MN(i, timedelay)
                            blocksToGetCount = blocksToGetCount + 1
						}
						
						// Add this Blockdata and blockNum (id) to a list
                        to_fetch.push({id: i, blockData});
					}

					if (to_fetch.length > 0) {
						// Sort the list by id (blockNum) so all our blocks can be processed in order
						to_fetch.sort((a, b) => a.id - b.id);
						// await the masternode results of all the blocks we needed (if any)
                        let processed = await Promise.all(to_fetch.map(b => b.blockData));
						
						// Loop through the blockData in order and process it
                        for (let blockData of processed) {
							// If any blocks are malformed then
							// 1) Don't process it
							// 2) Stop processig any more block data
							// 3) Check again in 30000 seconds
                            if (malformedBlock(blockData)) {
								// console.log({blockData})
								// console.log({latestBlockNum, currBlockNum})
                                log.log(`Malformed Block, trying again in 30 Seconds`)
                                timerId = setTimeout(checkForBlocks, 30000);
                                break
                            }else{
								// If the block is not malformed and actaully exists then process it
								if (blockExists(blockData)) await processBlock(blockData);
								
                            }
                        }
                    }else{
                        timerId = setTimeout(checkForBlocks, 10000);
                    }
				}

				if (latestBlockNum < currBlockNum) {
					await wipeDB(true);
					timerId = setTimeout(checkForBlocks, 10000);
				}
			}
		} else {
			/*
			log.log(
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
			//log.log("wipeOnStartup", wipeOnStartup);
			timerId = setTimeout(checkForBlocks, 0);
		});
};

function updateLastChecked(time_delta:number = 0) {
	ParserProvider.updateLastChecked(time_delta)
}

export default (handleNewBlock: handleNewBlock, bypass_wipe: boolean, instance_id: string, block_num?:number) => {
	db.connect(
		connectionString,
		{ useNewUrlParser: true, useUnifiedTopology: true },
		(error) => {
			if (error) log.log(error);
			else {
				//log.log("connection successful");
				databaseLoader(mongoose_models, handleNewBlock, bypass_wipe, instance_id, block_num);
			}
		}
	);
};
