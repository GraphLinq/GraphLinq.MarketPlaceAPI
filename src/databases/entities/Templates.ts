import { Column, Entity, PrimaryGeneratedColumn,OneToOne, JoinColumn,ManyToOne, JoinTable, ManyToMany, OneToMany} from "typeorm";

import {
  MaxLength,
  MinLength,
} from 'class-validator';
import Categories from "./Categories";
import Users from "./Users";
import Likes from "./Likes";

@Entity("market_templates", { schema: "graphlinq" })
export default class Templates {
  @PrimaryGeneratedColumn()
  id: number;

  @MinLength(3,{
    message : 'Name is to short'
  })
  @MaxLength(255,{
    message : 'Name is to big'
  })
  @Column("varchar")
  name : string | null


  @MinLength(10,{
    message : 'Description is to short'
  })
  @Column("text")
  description : string | null

  @ManyToOne(type => Users)
  @JoinColumn({name: 'user_id', referencedColumnName: 'id'})
  user : Users

  @ManyToOne(type => Categories )
  @JoinColumn({name: 'category_id', referencedColumnName: 'id'})
  category : Categories

  @OneToMany(type => Likes, like => like.template)
  likes : Likes[]

  @Column("decimal")
  template_cost : string

  @Column("decimal")
  execution_cost : string

  @Column("decimal")
  current_version : string
  
  @Column("text",{
    name: "raw_bytes",
    nullable: true,
    select: false
  })

  raw_bytes : string

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