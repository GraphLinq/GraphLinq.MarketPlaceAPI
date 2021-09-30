import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("likes", { schema: "graphlinq" })
export default class Likes {

  @PrimaryGeneratedColumn()
  id: number

  @Column("int")
  template_id : number

  @Column("int")
  user_id : number
}