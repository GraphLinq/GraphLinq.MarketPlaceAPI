import { Column, Entity, PrimaryGeneratedColumn,ManyToOne,JoinColumn } from "typeorm";
import Templates from "./Templates";

@Entity("likes", { schema: "graphlinq" })
export default class Likes {

  @PrimaryGeneratedColumn()
  id: number

  @ManyToOne(type => Templates, { cascade: true } )
  @JoinColumn({name: 'template_id', referencedColumnName: 'id'})
  template : Templates

  @Column("int")
  user_id : number


}