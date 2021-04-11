import { Entity, Column, BaseEntity, PrimaryGeneratedColumn, PrimaryColumn } from "typeorm";

@Entity()
export class MarketcapEntity extends BaseEntity {
	@PrimaryColumn()
	contract_name: string;

	@Column({ nullable: true })
	token_symbol: string;

	@Column({ nullable: true })
	marketcap_tau: number; // max_supply - circ supply

	@Column({ nullable: true })
	marketcap_usd: number;

	@Column({ nullable: true })
	circulating_supply: number;

	@Column({ nullable: true })
	base_supply: number;
}
