import { Injectable } from "@nestjs/common";
import * as lamden from "lamden-js";
import { config } from "./config";
import { SocketService } from "./socket.service";

@Injectable()
export class TransactionService {
	constructor(private readonly socketService: SocketService) {}

	private networkInfo = {
		type: config.networkType,
		hosts: [config.masternode]
	};

	public broadcastTxn(id: string, encrypted_txn: string) {
		const decrypted_message = lamden.utils.decryptObject(id, encrypted_txn);
		if (decrypted_message) {
			const payload = JSON.parse(decrypted_message);

			let txn = new lamden.TransactionBuilder(this.networkInfo, payload);
			txn.signature = payload.metadata.signature;
			txn.transactionSigned = true;
			txn.events.on("response", (response) => {
				this.socketService.handleProxyTxnResponse({
					socket_id: id,
					payload: response
				});
			});
			txn.send().then(() => txn.checkForTransactionResult());
		}
	}
}
