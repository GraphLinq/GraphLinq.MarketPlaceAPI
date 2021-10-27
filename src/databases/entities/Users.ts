import { Column, Entity, OneToMany, PrimaryGeneratedColumn,JoinColumn } from "typeorm";

import {
  MaxLength,
  MinLength,
} from 'class-validator';
import Templates from "./Templates";
import TemplatesPurchaseds from "./TemplatesPurchaseds";

@Entity("users", { schema: "graphlinq" })
export default class Users {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @MinLength(3,{
    message : 'Name is to short'
  })
  @MaxLength(255,{
    message : 'Name is to big'
  })
  @Column("varchar",{name : "name",nullable : true,length : 255})
  name : string | null

  @Column("text")
  picture : string | null

  @Column("varchar",{name : "email",nullable : true,length : 255})
  email : string | null

  @Column("varchar",{name : "publisher_name",nullable : true,length : 255})
  publisherName : string | null

  @Column("varchar",{name : "public_address",nullable : true,length : 255})
  publicAddress : string | null

  @Column("varchar",{name : "token",nullable : true,length : 255,select: false})
  token : string | null

  @OneToMany(type => Templates, template => template.user )
  publishedTemplates : Templates[]

  @OneToMany(type => Templates, template => template.user )
  favoritesTemplates : Templates[]

  @OneToMany(type => TemplatesPurchaseds, template => template.user )
  purchasedTemplates : TemplatesPurchaseds[]
  

  @Column("bool",{name : "is_admin",default : false})
  is_admin : boolean 

  @Column("datetime", {
    name: "created_at",
    nullable: true,
    default: () => "CURRENT_TIMESTAMP",
    select: false
  })
  createdAt: Date | null;

  @Column("datetime", {
    name: "updated_at",
    nullable: true,
    default: () => "CURRENT_TIMESTAMP",
    select: false

  })
  updatedAt: Date | null;



}