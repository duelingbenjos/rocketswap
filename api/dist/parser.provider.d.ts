import { IKvp } from "./types/misc.types";
import { IBlockParser } from "./types/websocket.types";
import { SocketService } from "./socket.service";
import { AuthService } from "./authentication/trollbox.service";
export declare class ParserProvider {
    private readonly socketService;
    private readonly authService;
    constructor(socketService: SocketService, authService: AuthService);
    private token_contract_list;
    private action_que;
    private action_que_processing;
    onModuleInit(): void;
    parseBlock: (update: IBlockParser) => Promise<void>;
    processAmmBlock: (args: {
        fn: string;
        state: IKvp[];
        timestamp: number;
    }) => Promise<void>;
    private executeActionQue;
    private addToActionQue;
    private updateTokenList;
}
