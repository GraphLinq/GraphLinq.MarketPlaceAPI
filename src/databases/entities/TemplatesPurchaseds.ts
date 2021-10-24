import { Column, Entity, PrimaryGeneratedColumn,OneToOne, JoinColumn,ManyToOne, JoinTable, ManyToMany, OneToMany} from "typeorm";
import Templates from "./Templates";
import Users from "./Users";


@Entity("market_templates_purchaseds", { schema: "graphlinq" })
export default class TemplatesPurchaseds {
  @PrimaryGeneratedColumn()
  id: number;
 
  @ManyToOne(type => Templates)
  @JoinColumn({name: 'template_id', referencedColumnName: 'id'})
  template : Templates
 
  @ManyToOne(type => Users)
  @JoinColumn({name: 'user_id', referencedColumnName: 'id'})
  user : Users

}