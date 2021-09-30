import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("categories", { schema: "graphlinq" })
export default class Categories {

  @PrimaryGeneratedColumn()
  id: number

  @Column("varchar")
  name : string | null

  @Column("varchar")
  long_name : string | null

  @Column("varchar")
  slug : string | null
}