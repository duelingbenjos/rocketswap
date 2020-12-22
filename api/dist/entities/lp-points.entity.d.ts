import { IKvp } from "src/types/misc.types";
import { BaseEntity } from "typeorm";
export declare class LpPointsEntity extends BaseEntity {
    vk: string;
    points: {
        [key: string]: number;
    };
    time: string;
}
export declare function saveUserLp(state: IKvp[]): Promise<void>;
