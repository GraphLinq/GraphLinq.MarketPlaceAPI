import { Column, Entity, PrimaryGeneratedColumn,ManyToOne,JoinColumn } from "typeorm";
import Users from "./Users";

@Entity("favorites", { schema: "graphlinq" })
export default class Favorites {

  @PrimaryGeneratedColumn()
  id: number

  @Column("int")
  template_id : number


  @ManyToOne(type => Users )
  @JoinColumn({name: 'user_id', referencedColumnName: 'id'})
  user : Users

}