declare const JWTGuard_base: import("@nestjs/passport").Type<import("@nestjs/passport").IAuthGuard>;
export declare class JWTGuard extends JWTGuard_base {
    handleRequest(err: any, user: any, info: Error): any;
}
export {};
