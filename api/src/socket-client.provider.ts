import * as io from "socket.io-client";
import { config } from "./config";
import { updateLastBlock } from "./entities/last-block.entity";
import { BlockService } from "./services/block.service";
import { IKvp } from "./types/misc.types";
import { log } from "./utils/logger";

let init = false;

export function initSocket(parseBlockFn: T_ParseBlockFn) {
	const block_service_url = `https://${BlockService.get_block_service_url}`;
	const socket = io(block_service_url, {
		reconnectionDelayMax: 10000
	});
	socket.on("connect", () => {
		log.log(`Connected to Blockservice via socket.io @ ${block_service_url}`);
		log.log({ init });
		if (!init) {
			socket.emit("join", "new-block");

			socket.on("new-block", async (payload) => {
				const parsed: I_v1_BsSocketBlockUpdate = JSON.parse(payload);
				const bs_block = parsed.message;
				await handleNewBlock(bs_block, parseBlockFn);
			});
			init = true;
		}
	});

	socket.io.on("reconnect", (attempt) => {
		log.log(`reconnected !`);
	});

	socket.io.on("reconnect_attempt", (attempt) => {
		log.log(`reconnecting attempt : ${attempt}`);
	});

	socket.io.on("error", (error) => {
		// socket.disconnect();
		// initSocket(parseBlockFn);
	});
}

export let handleNewBlock = async (block: I_v1_BsBlock | I_v2_Block, parseBlockFn: T_ParseBlockFn) => {
	config.lamden_version === "v2" ? handleV2Block(block as I_v2_Block, parseBlockFn) : handleV1Block(block as I_v1_BsBlock, parseBlockFn);
};

async function handleV2Block(block: I_v2_Block, parseBlockFn: T_ParseBlockFn) {
	// log.log({ block });
	if ((block as any).error) return;
	const timestamp = block.processed.transaction.metadata.timestamp;
	const hash = block.hash;
	const fn = block.processed.transaction.payload.function;
	const contract = block.processed.transaction.payload.contract;
	const state = block.processed.state;
	const block_dto: BlockDTO = { timestamp, hash, fn, contract, state };
	// log.log({ block_dto });
	// log.log({ block });
	await updateLastBlock({ block_num: Number(block.number) });
	await parseBlockFn(block_dto);
}

async function handleV1Block(block: I_v1_BsBlock, parseBlockFn: T_ParseBlockFn) {
	const has_transaction = block.subblocks.length && block.subblocks[0].transactions.length;
	if (!has_transaction) return;
	const { subblocks, number: block_num } = block;
	for (let sb of subblocks) {
		const { transactions } = sb;
		for (let t of transactions) {
			const { state, hash, transaction } = t;
			const fn = transaction.payload.function;
			const { contract } = transaction.payload;
			const { timestamp } = transaction.metadata;
			const block_obj: BlockDTO = { state, hash, fn, contract, timestamp };
			log.log(`Processed ${hash} for ${contract}`);
			if (Object.keys(state)?.length) {
				await parseBlockFn(block_obj);
			}
		}
		log.log(`processed ${transactions.length} transactions`);
	}
	updateLastBlock({ block_num });
}

export class BlockDTO {
	state: IKvp[];
	fn: string;
	contract: string;
	timestamp: number;
	hash: string;
	block_num?: number;
}

export interface I_v2_Block {
	hash: string;
	number: string;
	hlc_timestamp: string; // '2022-11-18T09:29:22.544632576Z_0',
	previous: string;
	proofs: { signature: string; signer: string }[];
	processed: I_v2_Processed;
	rewards: { key: string; value: { __fixed__: number }; rewards: { __fixed__: number } }[];
	origin: {
		signature: string;
		sender: string;
	};
}

export interface I_v2_Processed {
	hash: string;
	result: string;
	stamps_used: number;
	state: IKvp[];
	status: number;
	transaction: {
		metadata: {
			signature: string;
			timestamp: number;
		};
		payload: {
			contract: string;
			function: string;
			kwards: any;
			nonce: number;
			processor: string;
			sender: string;
			stamps_supplied: number;
		};
	}; // [Object]
}

export interface I_v1_BsSocketBlockUpdate {
	message: I_v1_BsBlock;
}

export interface I_v1_BsBlock {
	hash: string;
	number: number;
	previous: string;
	subblocks: I_v1_BsSubBlock[];
}

export interface I_v1_BsSubBlock {
	input_hash: string;
	merkle_leaves: string[];
	signatures: I_v1_Signature[];
	subblock: number;
	transactions: I_v1_Transaction[];
}

export interface I_v1_Signature {
	signature: string;
	signer: string;
}

export interface I_v1_Transaction {
	hash: string;
	result: string;
	stamps_user: number;
	state: IKvp[];
	status: number;
	transaction: I_v1_TransactionInner;
}

export interface I_v1_TransactionInner {
	metadata: any;
	payload: any;
}

export type T_ParseBlockFn = (args: BlockDTO) => Promise<any>;
