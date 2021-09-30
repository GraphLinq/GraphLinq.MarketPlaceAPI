import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

import {
  MaxLength,
  MinLength,
} from 'class-validator';

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

  @Column("int")
  user_id : number

  @Column("int")
  category_id : number
  
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