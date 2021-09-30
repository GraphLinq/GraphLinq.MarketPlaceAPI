import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

import {
  MaxLength,
  MinLength,
} from 'class-validator';

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

  @Column("varchar",{name : "email",nullable : true,length : 255})
  email : string | null

  @Column("varchar",{name : "publisher_name",nullable : true,length : 255})
  publisherName : string | null

  @Column("varchar",{name : "public_address",nullable : true,length : 255})
  publicAddress : string | null

  @Column("varchar",{name : "token",nullable : true,length : 255})
  token : string | null

  @Column("simple-array",{name : "published_templates" })
  publishedTemplates : number[]
  
  @Column("datetime", {
    name: "created_at",
    nullable: true,
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt: Date | null;

  @Column("datetime", {
    name: "updated_at",
    nullable: true,
    default: () => "CURRENT_TIMESTAMP",
  })
  updatedAt: Date | null;



}