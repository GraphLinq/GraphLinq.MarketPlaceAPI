import { Column, Entity, PrimaryGeneratedColumn,ManyToOne,JoinColumn } from "typeorm";
import Templates from "./Templates";

@Entity("likes", { schema: "graphlinq" })
export default class Likes {

  @PrimaryGeneratedColumn()
  id: number

  /*@Column("int")
  template_id : number*/

  @ManyToOne(type => Templates )
  @JoinColumn({name: 'template_id', referencedColumnName: 'id'})
  template : Templates

  @Column("int")
  user_id : number


}