import { Logger } from "@nestjs/common";
import {
	OnGatewayConnection,
	OnGatewayDisconnect,
	OnGatewayInit,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { AuthenticationPayload } from "./authentication/trollbox.controller";
import startBlockgrabber from "./blockgrabber";
import { BalanceEntity } from "./entities/balance.entity";
import { LpPointsEntity } from "./entities/lp-points.entity";
import { getTokenMetrics } from "./entities/price.entity";
import { TradeHistoryEntity } from "./entities/trade-history.entity";
import { ParserProvider } from "./parser.provider";
import { SocketService } from "./socket.service";
import { BlockDTO } from "./types/misc.types";
import {
	ClientUpdateType,
	isBalanceUpdate,
	isMetricsUpdate,
	isPriceUpdate,
	isTradeUpdate,
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

	constructor(
		private readonly parser: ParserProvider,
		private readonly socketService: SocketService
	) {
		startBlockgrabber(this.handleNewBlock);
	}

	afterInit(server: Server) {
		this.logger.log(`Websocket Initialised`);
		this.socketService.handleClientUpdate = this.handleClientUpdate;
		this.socketService.handleAuthenticateResponse = this.handleAuthenticateResponse;
		this.socketService.handleTrollboxMsg = this.handleTrollboxMsg;
	}

	handleNewBlock = async (block: BlockDTO) => {
		// const { state, fn, contract, timestamp } = block;
		await this.parser.parseBlock({
			block
		});
	};

	handleClientUpdate = async (update: ClientUpdateType) => {
		let contract_name;
		switch (update.action) {
			case "metrics_update":
				if (isMetricsUpdate(update)) {
					contract_name = update.contract_name;
					this.wss.emit(`price_feed:${contract_name}`, update);
					this.logger.log("price update sent");
				}
				break;
			case "balance_update":
				if (isBalanceUpdate(update)) {
					this.wss.emit(
						`balance_update:${update.payload.vk}`,
						update
					);
					this.logger.log(
						`balance update sent to : ${update.payload.vk}`
					);
				}
				break;
			case "trade_update":
				if (isTradeUpdate(update)) {
					this.wss.emit(`trade_update`, {update});
					this.wss.emit(
						`trade_update:${update.contract_name}`,
						update
					);
				}
				break;
		}
	};

	@SubscribeMessage("leave_room")
	handleLeaveRoom(client: Socket, room: string) {
		client.leave(room);
		client.emit("left_room", room);
	}

	@SubscribeMessage("join_room")
	async handleJoinRoom(client: Socket, room: string) {
		client.join(room);
		client.emit("joined_room", room);
		const [prefix, subject] = room.split(":");
		this.logger.log(prefix, subject);
		switch (prefix) {
			case "price_feed":
				this.handleJoinPriceFeed(subject, client);
				break;
			case "user_lp_feed":
				this.handleJoinUserLpFeed(subject, client);
				break;
			case "balance_feed":
				this.handleJoinBalanceFeed(subject, client);
				break;
			case "trade_feed":
				if (!subject) return;
				this.handleJoinTradeFeed(subject, client);
			case "trollbox":
				this.handleJoinTrollBox(client);
		}
	}

	private async handleJoinTrollBox(client: Socket) {
		client.emit("trollbox_authcode", client.id);
	}

	public handleTrollboxMsg = (message: {
		sender: string;
		message: string;
		timestamp: number;
	}) => {
		this.wss.emit("trollbox_message", message);
	};

	public handleAuthenticateResponse = (auth_response: {
		socket_id: string;
		payload: AuthenticationPayload;
	}) => {
		try {
			const { socket_id, payload } = auth_response;
			this.wss.to(socket_id).emit("auth_response", payload);
		} catch (err) {
			console.log(err);
		}
	};

	private async handleJoinTradeFeed(subject: string, client: Socket) {
		this.logger.log(`joined trade feed: ${subject}`);
		try {
			const trade_update = await TradeHistoryEntity.find({
				select: [
					"contract_name",
					"token_symbol",
					"price",
					"type",
					"time",
					"amount"
				],
				order: { time: "DESC" },
				where: { contract_name: subject },
				take: 50
			});
			client.emit(`trade_update:${subject}`, { history: trade_update });
		} catch (err) {
			this.logger.error(err);
		}
	}

	private async handleJoinBalanceFeed(vk: string, client: Socket) {
		console.log(`${vk} joined balance feed`);
		try {
			let balances: any = await BalanceEntity.findOne(vk);
			if (!balances)
				balances = {
					vk: vk,
					balances: {}
				};
			client.emit(`balance_list:${vk}`, balances);
		} catch (err) {
			console.error(err);
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
			// this.logger.log(metrics_action);
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
