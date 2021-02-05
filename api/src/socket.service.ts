import { Injectable } from "@nestjs/common";
import { Server } from "socket.io";
import {
	handleAuthenticateResponse,
	handleClientUpdate
} from "./types/websocket.types";

@Injectable()
export class SocketService {
	public handleClientUpdate: handleClientUpdate = null;
	public handleAuthenticateResponse: handleAuthenticateResponse = null;
}
