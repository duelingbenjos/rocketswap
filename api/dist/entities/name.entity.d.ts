import { IKvp } from "src/types/misc.types";
import { BaseEntity } from "typeorm";
export declare class NameEntity extends BaseEntity {
    vk: string;
    name: string;
}
export declare const setName: (state: IKvp[]) => Promise<void>;
