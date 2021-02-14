import { NameEntity } from "../entities/name.entity";
import { IKvp } from "../types/misc.types";
import { TokensService } from "./tokens.service";
import { AuthenticationPayload } from "./auth.controller";
import { SocketService } from "../socket.service";
export declare class AuthService {
    private readonly tokenService;
    private readonly socket;
    constructor(tokenService: TokensService, socket: SocketService);
    authenticate(state: IKvp[]): Promise<void>;
    buildResponsePayload(user: NameEntity, accessToken: string, refreshToken?: string): AuthenticationPayload;
}
