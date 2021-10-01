import { Column, Entity, PrimaryGeneratedColumn,OneToOne, JoinColumn,ManyToOne} from "typeorm";

import {
  MaxLength,
  MinLength,
} from 'class-validator';
import Categories from "./Categories";
import Users from "./Users";

@Entity("templates", { schema: "graphlinq" })
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

  
  @Column("decimal")
  template_cost : string

  @Column("decimal")
  execution_cost : string

  @Column("decimal")
  current_version : string



  @Column("datetime")
  createdAt: Date;

  @Column("datetime")
  updatedAt: Date;
}