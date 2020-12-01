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
import { BalanceEntity } from "./entities/balance.entity";
import { getNewJoiner, isLamdenKey } from "./utils";
import { ParserProvider } from "./parser.provider";

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
			this.handleStateUpdate
		);
	};

	handleStateUpdate = async (state_update: any) => {
		const { action, time, state, prev_state } = state_update;
		let game_id;
		switch (action) {
			case "dealDecisionCard":
				game_id = state.game_id;
				this.wss.emit(game_id, state);
				this.logger.log("dealDecisionCard update sent");
		}
	};

	// @SubscribeMessage("joinRoom")
	// async handleJoinRoom(socket: Socket, room: string) {
	// 	socket.join(room);
	// 	socket.emit("joinedRoom", room);
	// 	if (room === "global") {
	// 		const games = await GameEntity.find();
	// 		socket.emit("games_list", games);
	// 	} else if (isLamdenKey(room)) {
	// 		/** This is the users' channel, which they join on connection to the websocket. */
	// 		const balance = await BalanceEntity.findOne(room);
	// 		if (balance) {
	// 			socket.emit("balance_update", balance);
	// 		}
	// 	} else {
	// 		socket.emit("hi", "hi");
	// 	}
	// }

	@SubscribeMessage("leaveRoom")
	handleLeaveRoom(client: Socket, room: string) {
		client.leave(room);
		client.emit("leftRoom", room);
	}

	// async updateTableLog(game_id: string, message: string) {
	// 	this.wss.to(game_id).emit("status_message", message);
	// 	return await addToTableLog(game_id, message);
	// }

	handleDisconnect(client: Socket) {
		this.logger.log(`Client disconnected: ${client.id}`);
	}

	async handleConnection(socket: Socket, ...args: any[]) {
		this.logger.log(`Client connected: ${socket.id}`);
	}
}
