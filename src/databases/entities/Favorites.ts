import { Column, Entity, PrimaryGeneratedColumn,ManyToOne,JoinColumn } from "typeorm";
import Templates from "./Templates";
import Users from "./Users";

@Entity("favorites", { schema: "graphlinq" })
export default class Favorites {

  @PrimaryGeneratedColumn()
  id: number

  @ManyToOne(type => Templates )
  @JoinColumn({name: 'template_id', referencedColumnName: 'id'})
  template : Templates


  @Column("int")
  user_id : number

}