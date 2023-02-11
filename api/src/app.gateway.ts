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
import { BalanceEntity } from "./entities/balance.entity";
import { ChatHistoryEntity } from "./entities/chat-history.entity";
import { LpPointsEntity } from "./entities/lp-points.entity";
import { StakingMetaEntity } from "./entities/staking-meta.entity";
import { TokenEntity } from "./entities/token.entity";
import { TradeHistoryEntity } from "./entities/trade-history.entity";
import { TauMarketEntity } from "./entities/tau-market.entity";
// import { ParserProvider } from "./parser.provider";
import { SocketService } from "./services/socket.service";
import { TransactionService } from "./services/transaction.service";
import {
	ClientUpdateType,
	isBalanceUpdate,
	isMetricsUpdate,
	isTradeUpdate,
	IProxyTxnReponse,
	MetricsUpdateType,
	UserLpUpdateType,
	isUserLpUpdateType,
	isEpochUpdate,
	isUserYieldUpdate,
	isClientStakingUpdate,
	isTauUsdPriceUpdate,
	isNewMarketUpdate,
	isStakingPanelUpdate
} from "./types/websocket.types";
import { log } from "./utils/logger";

import { getTokenMetrics } from "./entities/price.entity";
import { datetimeToUnix } from "./utils/yield-utils";
/**
 * Gateway uses socket.io v2^
 * https://socket.io/docs/v2/server-api/
 */
@WebSocketGateway({ origin: "*", cors: { origins: ["*", "staging.rocketswap.exchange", "localhost", "portal.rocketswap.exchange"] } })
export class AppGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
	private logger: Logger = new Logger("AppGateway");

	@WebSocketServer() wss: Server;

	constructor(private readonly socketService: SocketService, private readonly txnService: TransactionService) {}

	afterInit(server: Server) {
		this.logger.log(`Websocket Initialised`);
		this.socketService.handleClientUpdate = this.handleClientUpdate;
		this.socketService.handleAuthenticateResponse = this.handleAuthenticateResponse;
		this.socketService.handleTrollboxMsg = this.handleTrollboxMsg;
		this.socketService.handleProxyTxnResponse = this.handleTxnResponse;
	}

	handleClientUpdate = async (update: ClientUpdateType) => {
		let contract_name;
		//log.log(update)
		switch (update.action) {
			case "metrics_update":
				if (isMetricsUpdate(update)) {
					contract_name = update.contract_name;
					// log.log(update)
					this.wss.emit(`price_feed:${contract_name}`, update);
					// this.logger.log("price update sent");
				}
				break;
			case "balance_update":
				if (isBalanceUpdate(update)) {
					this.wss.emit(`balance_update:${update.payload.vk}`, update);
				}
				break;
			case "user_lp_update":
				if (isUserLpUpdateType(update)) {
					// log.log(update)
					this.wss.emit(`user_lp_update:${update.vk}`, update);
				}
				break;
			case "trade_update":
				if (isTradeUpdate(update)) {
					this.wss.emit(`trade_update`, { update });
					this.wss.emit(`trade_update:${update.contract_name}`, update);
					this.wss.emit(`trade_update:global`, update);
				}
				break;
			case "epoch_update":
				if (isEpochUpdate(update)) {
					// log.log("EPOCH_UPDATE", update);
					setTimeout(async () => {
						await this.socketService.sendClientStakingUpdates(update.data.staking_contract);
					}, 2000);
					// this.wss.emit(`epoch_update`, update);
				}
				break;
			case "client_staking_update":
				if (isClientStakingUpdate(update)) {
					// log.log("EPOCH_UPDATE", update);
					// setTimeout(async () => {
					await this.socketService.sendClientStakingUpdates(update.staking_contract);
					// }, 2000);
					// this.wss.emit(`epoch_update`, update);
				}
				break;
			case "user_yield_update":
				if (isUserYieldUpdate(update)) {
					// log.log("UPDATE", update);
					this.wss.emit(`user_yield_update:${update.vk}`, update.data);
				}
			case "tau_usd_price":
				if (isTauUsdPriceUpdate(update)) {
					// log.log("UPDATE", update);
					this.wss.emit(`tau_usd_price`, update);
				}
				break;
			case "new_market_update":
				if (isNewMarketUpdate(update)) {
					this.wss.emit("new_market_update", update);
				}
				break;
			// case "staking_panel_update":
			// 	if (isStakingPanelUpdate(update)) {
			// 		this.wss.emit("staking_panel_update", update);
			// 	}
			// 	break;
		}
	};

	@SubscribeMessage("leave_room")
	handleLeaveRoom(client: Socket, room: string) {
		client.leave(room);
		client.emit("left_room", room);
		this.logger.log("LEFT ROOM");
		const [prefix, subject] = room.split(":");

		switch (prefix) {
			case "user_yield_feed":
				this.socketService.removeStakingPanelClient(subject);
				break;
		}
	}

	@SubscribeMessage("join_room")
	async handleJoinRoom(client: Socket, room: string) {
		client.join(room);
		client.emit("joined_room", room);
		// log.log({ joined: room });
		const [prefix, subject] = room.split(":");
		switch (prefix) {
			case "price_feed":
				this.handleJoinPriceFeed(subject, client);
				break;
			case "user_lp_feed":
				log.log("joining user_lp_feed");
				this.handleJoinUserLpFeed(subject, client);
				break;
			case "balance_feed":
				this.handleJoinBalanceFeed(subject, client);
				break;
			case "trade_feed":
				if (!subject) return;
				this.handleJoinTradeFeed(subject, client);
				break;
			case "trollbox":
				this.handleJoinTrollBox(client);
				break;
			case "staking_panel":
				this.handleJoinStakingPanel(client);
				break;
			case "user_yield_feed":
				this.handleJoinUserYieldFeed(subject, client);
				break;
			case "tau_usd_price":
				this.handleJoinTauUsdPrice(client);
				break;
		}
	}

	@SubscribeMessage("send_transaction")
	async handleClientTransaction(client: Socket, txn: any) {
		this.txnService.broadcastTxn(client.id, txn);
	}

	private async handleJoinUserYieldFeed(subject: string, client: Socket) {
		// log.log(`${client.id} joined ${subject}`);
		this.socketService.addStakingPanelClient(subject);
		const yield_list = await this.socketService.getClientYieldList(subject);
		client.emit("user_yield_list", yield_list);
	}

	private async handleJoinTauUsdPrice(client: Socket) {
		let entity = await TauMarketEntity.findOne({ info_type: "usd_price" });
		client.emit("tau_usd_price", { current_price: entity?.value || 0 });
	}

	private async handleJoinStakingPanel(client: Socket) {
		const staking_entities = await StakingMetaEntity.find({ where: { visible: true } });
		let response = staking_entities.reverse().map(async (entity) => {
			return new Promise(async (resolver) => {
				const staking_token = await TokenEntity.findOne({ contract_name: entity.meta.STAKING_TOKEN });
				const yield_token = await TokenEntity.findOne({ contract_name: entity.meta.YIELD_TOKEN });
				resolver({
					...entity,
					staking_token,
					yield_token
				});
			});
		});
		client.emit("staking_panel", await Promise.all(response));
	}

	private async handleJoinTrollBox(client: Socket) {
		client.emit("trollbox_authcode", client.id);
		try {
			let history = await ChatHistoryEntity.find({
				select: ["message", "timestamp", "sender"],
				take: 50,
				order: { timestamp: "DESC" }
			});
			history.sort((a, b) => {
				return a.timestamp - b.timestamp;
			});
			client.emit("trollbox_history", history);
		} catch (err) {
			this.logger.error(err);
		}
	}

	public handleTrollboxMsg = (message: { sender: string; message: string; timestamp: number }) => {
		this.wss.emit("trollbox_message", message);
	};

	public handleAuthenticateResponse = (auth_response: { socket_id: string; payload: AuthenticationPayload }) => {
		try {
			const { socket_id, payload } = auth_response;
			this.wss.to(socket_id).emit("auth_response", payload);
		} catch (err) {
			this.logger.error(err);
		}
	};

	public handleTxnResponse = (args: IProxyTxnReponse) => {
		const { payload, socket_id } = args;
		this.wss.to(socket_id).emit("proxy_txn_res", payload);
	};

	private async handleJoinTradeFeed(subject: string, client: Socket) {
		try {
			if (subject !== "global") {
				const trade_update = await TradeHistoryEntity.find({
					select: ["contract_name", "token_symbol", "price", "type", "time", "amount"],
					order: { time: "DESC" },
					where: { contract_name: subject },
					take: 50
				});
				client.emit(`trade_update:${subject}`, { history: trade_update });
			}
		} catch (err) {
			this.logger.error(err);
		}
	}

	private async handleJoinBalanceFeed(vk: string, client: Socket) {
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
				points,
				vk
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
			client.emit(`price_feed:${contract_name}`, metrics_action);
		} catch (err) {
			this.logger.error(err);
		}
	}

	handleDisconnect(client: Socket) {
		this.logger.log(`Client disconnected: ${client.id}`);
	}

	async handleConnection(socket: Socket, ...args: any[]) {
		// this.logger.log(`Client connected: ${socket.id}`);
	}
}
