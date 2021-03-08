export class BlockDTO {
	state: IKvp[];
	fn: string;
	contract: string;
	timestamp: number;
	hash: string;
}

export interface IKvp {
	key: string;
	value: any;
}

export interface handleNewBlock {
	(block: BlockDTO): Promise<void>;
}
