import { Injectable } from "@nestjs/common";
import * as lamden from "lamden-js";
import { config } from "../config";
import { SocketService } from "./socket.service";
import { ITxnRequest } from "../types/websocket.types";

@Injectable()
export class TransactionService {
	constructor(private readonly socketService: SocketService) {}

	private networkInfo = {
		type: config.network_type,
		hosts: [config.masternode]
	};

	public broadcastTxn(id: string, tx: ITxnRequest) {
		const sendSocketResponse = (payload: any) => {
			this.socketService.handleProxyTxnResponse({
				socket_id: id,
				payload
			});
		};
		try {
			var { payload, metadata } = tx;
			payload.senderVk = payload.sender;
			payload.contractName = payload.contract;
			payload.methodName = payload.function;
			payload.stampLimit = payload.stamps_supplied;
			if (!payload) throw new Error("No payload found in tx info.");
			if (!metadata?.signature)
				throw new Error("Signature not found in tx metadata.");
			var txn = new lamden.TransactionBuilder(this.networkInfo, payload);
		} catch (e) {
			sendSocketResponse({ error: e.message });
			return;
		}

		txn.signature = metadata.signature;
		txn.transactionSigned = true;
		txn.events.on("response", (response) => {
			sendSocketResponse(txn.getAllInfo());
		});
		txn.send().then(() => txn.checkForTransactionResult());
	}
}
