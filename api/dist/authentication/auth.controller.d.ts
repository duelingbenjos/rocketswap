import { RefreshRequest } from "../requests";
import { NameEntity } from "../entities/name.entity";
import { TokensService } from "./tokens.service";
import { AuthService } from "./auth.service";
export interface AuthenticationPayload {
    user: NameEntity;
    payload: {
        type: string;
        token: string;
        refresh_token?: string;
    };
}
export declare class AuthenticationController {
    private readonly tokens;
    private readonly authService;
    constructor(tokens: TokensService, authService: AuthService);
    refresh(body: RefreshRequest): Promise<{
        status: string;
        data: AuthenticationPayload;
    }>;
    getUser(request: any): Promise<{
        status: string;
        data: NameEntity;
    }>;
}
