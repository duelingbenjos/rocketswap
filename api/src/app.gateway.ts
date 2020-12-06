import { Logger } from "@nestjs/common";
import {
	OnGatewayConnection,
	OnGatewayDisconnect,
	OnGatewayInit,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
	WsResponse
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import blockgrabber from "./blockgrabber";
import { ParserProvider } from "./parser.provider";
import { ClientUpdateType, isPriceUpdate } from "./types/websocket.types";

@WebSocketGateway()
export class AppGateway
	implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
	private logger: Logger = new Logger("AppGateway");

	@WebSocketServer() wss: Server;

	constructor(private readonly parser: ParserProvider) {
		blockgrabber(this.handleNewBlock);
	}

	afterInit(server: Server) {
		this.logger.log(`Websocket Initialised`);
	}

	handleNewBlock = (block: any) => {
		const { state, fn, contract } = block;
		this.parser.parseBlock(
			{
				state,
				fn,
				contract
			},
			this.handleClientUpdate
		);
	};

	handleClientUpdate = async (update: ClientUpdateType) => {
		let contract_name;
		switch (update.action) {
			case "price_update":
				if (isPriceUpdate(update))
				contract_name = update.contract_name;
				this.wss.emit(`price_update:${contract_name}`, update);
				this.logger.log("price update sent");
		}
	};

	@SubscribeMessage("leave_room")
	handleLeaveRoom(client: Socket, room: string) {
		client.leave(room);
		client.emit("left_room", room);
	}

	@SubscribeMessage("join_room")
	handleJoinRoom(client: Socket, room: string) {
		client.join(room);
		client.emit("joined_room", room);
	}

	handleDisconnect(client: Socket) {
		this.logger.log(`Client disconnected: ${client.id}`);
	}

	async handleConnection(socket: Socket, ...args: any[]) {
		this.logger.log(`Client connected: ${socket.id}`);
	}
}
