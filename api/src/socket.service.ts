import { Injectable } from "@nestjs/common";
import { Server } from "socket.io";
import {
	handleAuthenticateResponse,
	handleClientUpdate,
	handleTrollboxMsg,
	handleProxyTxnResponse
} from "./types/websocket.types";

@Injectable()
export class SocketService {
	public handleClientUpdate: handleClientUpdate = null;
	public handleAuthenticateResponse: handleAuthenticateResponse = null;
	public handleTrollboxMsg: handleTrollboxMsg = null
	public handleProxyTxnResponse: handleProxyTxnResponse = null
}
