import { Logger } from "@nestjs/common";
import { NameEntity } from "../entities/name.entity";
export interface AccessTokenPayload {
    sub: number;
}
declare const JwtStrategy_base: new (...args: any[]) => any;
export declare class JwtStrategy extends JwtStrategy_base {
    private logger;
    constructor(logger: Logger);
    validate(payload: AccessTokenPayload): Promise<NameEntity>;
}
export {};
