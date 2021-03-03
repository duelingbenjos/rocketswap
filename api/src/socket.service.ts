import { Injectable } from "@nestjs/common";
import { Server } from "socket.io";
import {
	handleAuthenticateResponseType,
	handleClientUpdateType,
	handleTrollboxMsg,
	handleProxyTxnResponse
} from "./types/websocket.types";

@Injectable()
export class SocketService {
	public handleClientUpdate: handleClientUpdateType = null;
	public handleAuthenticateResponse: handleAuthenticateResponseType = null;
	public handleTrollboxMsg: handleTrollboxMsg = null
	public handleProxyTxnResponse: handleProxyTxnResponse = null
}
