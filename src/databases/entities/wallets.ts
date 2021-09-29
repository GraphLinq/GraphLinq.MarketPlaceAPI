import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("wallets", { schema: "graphlinq" })
export default class Wallets {
  @PrimaryGeneratedColumn({ type: "int", name: "id_wallet" })
  idWallet: number;

  @Column("decimal", {
    name: "due_balance",
    nullable: true,
    precision: 10,
    scale: 8,
  })
  dueBalance: string | null;

  @Column("varchar", { name: "signed_jwt", nullable: true, length: 255 })
  signedJwt: string | null;

  @Column("datetime", {
    name: "created_at",
    nullable: true,
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt: Date | null;

  @Column("datetime", {
    name: "updated_at",
    nullable: true,
    default: () => "CURRENT_TIMESTAMP",
  })
  updatedAt: Date | null;

  @Column("varchar", { name: "public_address", length: 255 })
  publicAddress: string;
}