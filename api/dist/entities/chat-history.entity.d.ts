import { BaseEntity } from "typeorm";
import { ITrollBoxMessage } from "src/types/websocket.types";
export declare class ChatHistoryEntity extends BaseEntity {
    id: number;
    message: string;
    sender: any;
    timestamp: number;
}
export declare const saveTrollChat: (payload: ITrollBoxMessage) => Promise<void>;
