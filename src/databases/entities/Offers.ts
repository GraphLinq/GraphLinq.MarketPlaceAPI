import { Column, Entity, PrimaryGeneratedColumn,OneToOne, JoinColumn,ManyToOne, JoinTable, ManyToMany, OneToMany} from "typeorm";

import {
  MaxLength,
  MinLength,
  IsDecimal,
  IsInt,
  IsEmail
} from 'class-validator';
import Categories from "./Categories";
import Users from "./Users";
import Likes from "./Likes";
import TemplatesVersion from "./TemplatesVersions";

//@Entity("offer_templates", { schema: "graphlinq" })
export default class Offer {
  @PrimaryGeneratedColumn()
  id: number;

  @MinLength(3,{
    message : 'Name is to short'
  })
  @MaxLength(255,{
    message : 'Name is to big'
  })
  @Column("varchar")
  title : string | null


  @MinLength(10,{
    message : 'Description is to short'
  })
  @Column("text")
  description : string | null

  
  @Column("text")
  email : string | null

  @ManyToOne(type => Users)
  @JoinColumn({name: 'user_id', referencedColumnName: 'id'})
  user : Users


  @IsInt({
    message : 'The price of the template is not integer'
  })
  
  @Column("int")
  budget : string



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