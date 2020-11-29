export class BlockDTO {
	state: IKvp[];
	fn: string;
	contract: string;
}

export interface IKvp {
	key: string;
	value: any;
}
