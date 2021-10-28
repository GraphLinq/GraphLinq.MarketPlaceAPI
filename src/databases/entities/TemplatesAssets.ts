import { Column, Entity, PrimaryGeneratedColumn,OneToOne, JoinColumn,ManyToOne, JoinTable, ManyToMany, OneToMany} from "typeorm";
import Templates from "./Templates";
import Users from "./Users";


@Entity("market_templates_assets", { schema: "graphlinq" })
export default class TemplatesAssets {
  @PrimaryGeneratedColumn()
  id: number;
 
  @ManyToOne(type => Templates)
  @JoinColumn({name: 'template_id', referencedColumnName: 'id'})
  template : Templates
 
  @Column("varchar",{name : "type",nullable : true,length : 255})
  type : string | null

  @Column("longtext")
  data : string | null

}