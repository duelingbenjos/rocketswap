import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { AuthenticationPayload } from "./authentication/trollbox.controller";
import { ParserProvider } from "./parser.provider";
import { SocketService } from "./socket.service";
import { BlockDTO } from "./types/misc.types";
import { ClientUpdateType } from "./types/websocket.types";
export declare class AppGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    private readonly parser;
    private readonly socketService;
    private logger;
    wss: Server;
    constructor(parser: ParserProvider, socketService: SocketService);
    afterInit(server: Server): void;
    handleNewBlock: (block: BlockDTO) => Promise<void>;
    handleClientUpdate: (update: ClientUpdateType) => Promise<void>;
    handleLeaveRoom(client: Socket, room: string): void;
    handleJoinRoom(client: Socket, room: string): Promise<void>;
    private handleJoinTrollBox;
    handleTrollboxMsg: (message: {
        sender: string;
        message: string;
        timestamp: number;
    }) => void;
    handleAuthenticateResponse: (auth_response: {
        socket_id: string;
        payload: AuthenticationPayload;
    }) => void;
    private handleJoinTradeFeed;
    private handleJoinBalanceFeed;
    private handleJoinUserLpFeed;
    private handleJoinPriceFeed;
    handleDisconnect(client: Socket): void;
    handleConnection(socket: Socket, ...args: any[]): Promise<void>;
}
