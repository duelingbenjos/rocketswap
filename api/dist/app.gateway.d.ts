import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { ParserProvider } from "./parser.provider";
import { ClientUpdateType } from "./types/websocket.types";
export declare class AppGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    private readonly parser;
    private logger;
    wss: Server;
    constructor(parser: ParserProvider);
    afterInit(server: Server): void;
    handleNewBlock: (block: any) => Promise<void>;
    handleClientUpdate: (update: ClientUpdateType) => Promise<void>;
    handleLeaveRoom(client: Socket, room: string): void;
    handleJoinRoom(client: Socket, room: string): Promise<void>;
    private handleJoinBalanceFeed;
    private handleJoinUserLpFeed;
    private handleJoinPriceFeed;
    handleDisconnect(client: Socket): void;
    handleConnection(socket: Socket, ...args: any[]): Promise<void>;
}
