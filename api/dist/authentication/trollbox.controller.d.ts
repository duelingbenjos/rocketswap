import { RefreshRequest } from "../requests";
import { NameEntity } from "../entities/name.entity";
import { TokensService } from "./tokens.service";
import { AuthService } from "./trollbox.service";
import { SocketService } from "../socket.service";
export interface AuthenticationPayload {
    user: NameEntity;
    payload: {
        type: string;
        token: string;
        refresh_token?: string;
    };
}
export declare class TrollboxController {
    private readonly tokens;
    private readonly authService;
    private readonly socketService;
    constructor(tokens: TokensService, authService: AuthService, socketService: SocketService);
    refresh(body: RefreshRequest): Promise<{
        status: string;
        data: AuthenticationPayload;
    }>;
    send_message(request: any): Promise<void>;
    getUser(request: any): Promise<{
        status: string;
        data: NameEntity;
    }>;
}
