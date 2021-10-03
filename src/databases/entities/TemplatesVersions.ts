import { Column, Entity, PrimaryGeneratedColumn,OneToOne, JoinColumn,ManyToOne, JoinTable, ManyToMany, OneToMany} from "typeorm";

import {
  isDecimal,
  Matches
} from 'class-validator';
import Categories from "./Categories";
import Users from "./Users";
import Likes from "./Likes";
import Templates from "./Templates";

@Entity("market_templates_versions", { schema: "graphlinq" })
export default class TemplatesVersion {
  @PrimaryGeneratedColumn()
  id: number;


  @ManyToOne(type => Templates )
  @JoinColumn({name: 'template_id', referencedColumnName: 'id'})
  template : Templates

  @Matches(/\d{1,2}\.\d{1,2}\.\d{1,3}$/,{
    message : 'the format is incorrect, example: xx.xx.xxx'
  })
  @Column("varchar",{
    name: "current_version",
    length : 255,
  })
  current_version : string
  
  @Column("text",{
    name: "raw_bytes",
    nullable: true,
    select: false
  })
  raw_bytes : string

  @Column("decimal", { precision: 5, scale: 2 })
  execution_cost : number

  @Column("datetime", {
    name: "created_at",
    nullable: true,
    default: () => "CURRENT_TIMESTAMP",
    select: false
  })  
  createdAt: Date;

  @Column("datetime", {
    name: "updated_at",
    nullable: true,
    default: () => "CURRENT_TIMESTAMP",
    select: false
  })
  updatedAt: Date;
}