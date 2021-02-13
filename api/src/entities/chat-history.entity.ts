import { IKvp } from "src/types/misc.types";
import { getVal } from "../utils";
import { config } from "../config";
import {
	Entity,
	Column,
	BaseEntity,
	PrimaryColumn,
	PrimaryGeneratedColumn
} from "typeorm";
import { ITrollBoxMessage } from "src/types/websocket.types";

@Entity()
export class ChatHistoryEntity extends BaseEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	message: string
	
	@Column({type: 'simple-json'})
	sender: any

	@Column()
	timestamp: number
}
export const saveTrollChat = async (payload: ITrollBoxMessage) => {
	const entity = new ChatHistoryEntity()
	entity.message = payload.message
	entity.sender = payload.sender
	entity.timestamp = payload.timestamp
	await entity.save()
};
