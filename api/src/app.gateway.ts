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
import { LpPointsEntity } from "./entities/lp-points.entity";
import { getTokenMetrics, PriceEntity } from "./entities/price.entity";
import { ParserProvider } from "./parser.provider";
import {
	ClientUpdateType,
	isMetricsUpdate,
	isPriceUpdate,
	MetricsUpdateType,
	UserLpUpdateType
} from "./types/websocket.types";

/**
 * Gateway uses socket.io v2^
 * https://socket.io/docs/v2/server-api/
 */
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

	handleNewBlock = async (block: any) => {
		const { state, fn, contract } = block;
		await this.parser.parseBlock({
			block: {
				state,
				fn,
				contract
			},
			handleClientUpdate: this.handleClientUpdate
		});
	};

	handleClientUpdate = async (update: ClientUpdateType) => {
		let contract_name;
		switch (update.action) {
			case "metrics_update":
				if (isMetricsUpdate(update))
					contract_name = update.contract_name;
				this.wss.emit(`price_feed:${contract_name}`, update);
				this.logger.log("price update sent");
		}
	};

	@SubscribeMessage("leave_room")
	handleLeaveRoom(client: Socket, room: string) {
		client.leave(room);
		client.emit("left_room", room);
	}

	@SubscribeMessage("join_room")
	async handleJoinRoom(client: Socket, room: string) {
		this.logger.log(room);
		// join user to room
		client.join(room);
		client.emit("joined_room", room);

		const [prefix, subject] = room.split(":");
		switch (prefix) {
			case "price_feed":
				this.handleJoinPriceFeed(subject, client);
				break;
			case "user_lp_feed":
				this.handleJoinUserLpFeed(subject, client);
				break;
		}
		let contract_name = room.split(":")[1];
		//console.log(room);
		if (contract_name) {
		}
	}

	private async handleJoinUserLpFeed(vk: string, client: Socket) {
		try {
			const user_lp_points = await LpPointsEntity.findOneOrFail(vk);
			const { points } = user_lp_points;
			const user_lp_action: UserLpUpdateType = {
				action: "user_lp_update",
				points
			};
			client.emit(`user_lp_feed:${vk}`, user_lp_action);
		} catch (err) {
			this.logger.error(err);
		}
	}

	private async handleJoinPriceFeed(contract_name: string, client: Socket) {
		try {
			const metrics = await getTokenMetrics(contract_name);
			const metrics_action: MetricsUpdateType = {
				action: "metrics_update",
				...metrics
			};
			this.logger.log(metrics_action);
			client.emit(`price_feed:${contract_name}`, metrics_action);
		} catch (err) {
			this.logger.error(err);
		}
	}

	handleDisconnect(client: Socket) {
		this.logger.log(`Client disconnected: ${client.id}`);
	}

	async handleConnection(socket: Socket, ...args: any[]) {
		this.logger.log(`Client connected: ${socket.id}`);
	}
}
