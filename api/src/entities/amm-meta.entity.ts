import { IKvp } from "src/types/misc.types";
import { getVal } from "../utils/utils";
import { config } from "../config";
import {
	Entity,
	Column,
	BaseEntity,
	PrimaryColumn,
	PrimaryGeneratedColumn
} from "typeorm";
import { handleClientUpdateType } from "../types/websocket.types";

@Entity()
export class AmmMetaEntity extends BaseEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ nullable: true })
	FEE_PERCENTAGE: string;

	@Column({ nullable: true })
	TOKEN_CONTRACT: string;

	@Column({ nullable: true })
	TOKEN_DISCOUNT: string;

	@Column({ nullable: true })
	BURN_PERCENTAGE: string;

	@Column({ nullable: true })
	BURN_ADDRESS: string;

	@Column({ nullable: true })
	LOG_ACCURACY: string;

	@Column({ nullable: true })
	MULTIPLIER: string;

	@Column({ nullable: true })
	OWNER: string;

	@Column({ nullable: true })
	__developer__: string;
}

// {
// 	key: 'con_amm_3.state:FEE_PERCENTAGE',
// 	value: { __fixed__: '0.003' }
//   },
//   { key: 'con_amm_3.state:TOKEN_CONTRACT', value: 'con_amm' },
//   {
// 	key: 'con_amm_3.state:TOKEN_DISCOUNT',
// 	value: { __fixed__: '0.75' }
//   },
//   {
// 	key: 'con_amm_3.state:BURN_PERCENTAGE',
// 	value: { __fixed__: '0.8' }
//   },
//   { key: 'con_amm_3.state:BURN_ADDRESS', value: '0x0' },
//   {
// 	key: 'con_amm_3.state:LOG_ACCURACY',
// 	value: { __fixed__: '1000000000.0' }
//   },
//   { key: 'con_amm_3.state:MULTIPLIER', value: { __fixed__: '0.05' } },
//   {
// 	key: 'con_amm_3.state:OWNER',
// 	value: 'f16c130ceb7ed9bcebde301488cfd507717d5d511674bc269c39ad41fc15d780'
//   },

export const updateAmmMeta = async (args: {
	state: IKvp[];
	handleClientUpdate: handleClientUpdateType;
}) => {
	const { state, handleClientUpdate } = args;

	let entity = await AmmMetaEntity.findOne();
	if (!entity) entity = new AmmMetaEntity();
	state.forEach((kvp) => {
		switch (kvp.key) {
			case `${config.contractName}.state:FEE_PERCENTAGE`:
				entity["FEE_PERCENTAGE"] = getVal(kvp);
				break;
			case `${config.contractName}.state:TOKEN_CONTRACT`:
				entity["TOKEN_CONTRACT"] = getVal(kvp);
				break;
			case `${config.contractName}.state:TOKEN_DISCOUNT`:
				entity["TOKEN_DISCOUNT"] = getVal(kvp);
				break;
			case `${config.contractName}.state:BURN_PERCENTAGE`:
				entity["BURN_PERCENTAGE"] = getVal(kvp);
				break;
			case `${config.contractName}.state:BURN_ADDRESS`:
				entity["BURN_ADDRESS"] = getVal(kvp);
				break;
			case `${config.contractName}.state:LOG_ACCURACY`:
				entity["LOG_ACCURACY"] = getVal(kvp);
				break;
			case `${config.contractName}.state:MULTIPLIER`:
				entity["MULTIPLIER"] = getVal(kvp);
				break;
			case `${config.contractName}.state:OWNER`:
				entity["OWNER"] = getVal(kvp);
				break;
			case `${config.contractName}.__developer__`:
				entity["__developer__"] = getVal(kvp);
				break;
		}
	});
	await entity.save();
};
