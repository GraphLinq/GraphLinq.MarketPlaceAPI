import express = require("express");
import { getConnection } from "typeorm";
import Templates from "../databases/entities/Templates" 
import authentification from "../middlewares/authentification";
import Users from "../databases/entities/Users" 
import Likes from "../databases/entities/Likes" 
import Categories from "../databases/entities/Categories";
import {validate} from "class-validator";
import { UniqueMetadataArgs } from "typeorm/metadata-args/UniqueMetadataArgs";


var router = express.Router();

router.get('/',async(req,res) => {

    try{
        const page : number | undefined  = Number(req.query.page)
        const limit : number | undefined  = Number(req.query.limit)

        if( page == undefined || limit == undefined){
            return res.status(500).send()
        }
    
        var builder = await getConnection().getRepository(Templates)
        .createQueryBuilder('template')
        
    
        if(req.query.category != undefined){
            const category: number | undefined = Number(req.query.category)
            builder = builder.where("template.category_id = :filter",{filter : category})
        }
    
        builder = builder.offset((page - 1) * limit).limit(limit)

        if(req.query.sort != undefined){
             
            const sort : number | undefined  = Number(req.query.sort)
            // todo : make this more dynamic after / actualy for test
            // sort by recently added
            if(sort == 0){
                builder = builder.orderBy("template.createdAt","DESC")     
            }// price low -> hight
            else if(sort == 2){
                builder = builder.orderBy("template.template_cost","ASC")   
            }// price hight -> low
            else if(sort == 3){
                builder = builder.orderBy("template.template_cost","DESC")   
            }
        }
        
        builder = builder.leftJoinAndSelect("template.category", "category")
        builder = builder.leftJoinAndSelect("template.user", "user")
        builder = builder.leftJoinAndSelect("template.likes", "like")

        var resultsQuery = await builder.getMany()
        res.send({
            success : true,
            results : resultsQuery
        })

    }catch (error)
    {
      console.log(error)
      return res.status(500).send();
    }
    
})

router.post('/',authentification,async(req,res)=>{

    const authentification : any = (req as any).authentification
    var address: string  = String(authentification.address)
    try{
        let user: Users | undefined = await getConnection().getRepository(Users).findOne({publicAddress: address})


        let template = new Templates()
        template.name = req.body.name
        template.description = req.body.description
        template.template_cost = req.body.template_cost
        template.user = user
        template.category = await getConnection().getRepository(Categories).findOne({id : req.body.category_id})
        template.execution_cost =  "0"
        template.current_version =  "0"
        template.raw_bytes = req.body.data

        const errors = await validate(template)

        if(errors.length > 0){

          return res.send({
            success : false,
            "errors" : errors.map(x =>  
             ({
                name : x.property,
                messages  : x.constraints
              })
            )
          })

        }else{

          await getConnection().getRepository(Templates).save(template)
          return res.send({success : true})
        }

    }catch(error){

        console.log(error)
        return res.status(500).send();
    }
})

router.get('/names/:name',async(req,res)=>{
    try{
        let name:string = req.params.name

        var builder = await getConnection().getRepository(Templates)
                  .createQueryBuilder("template")
                  .where("template.name like :n", { n:`%${name}%` });

        builder = builder.leftJoinAndSelect("template.category", "category")
        builder = builder.leftJoinAndSelect("template.user", "user")
        builder = builder.leftJoinAndSelect("template.likes", "like")

        var resultsQuery = await builder.getMany()
        res.send({
            success : true,
            results : resultsQuery
        }) 
                   
    }catch (error)
    {
      return res.status(500).send();
    }
})

router.post('/:template_id/likes',authentification,async(req,res)=>{
    const authentification : any = (req as any).authentification
    var address: string  = String(authentification.address)

    try{

        let user: Users | undefined = await getConnection().getRepository(Users).findOne({publicAddress: address})
        let template : Templates | undefined = await getConnection().getRepository(Templates)
                                                                    .findOne({id : Number(req.params.template_id)})

        let targetTemplate : Likes | undefined = await getConnection().getRepository(Likes)
                                                                            .findOne({template : template,
                                                                                      user_id : user.id})
        // there has not yet been a like in the template                                                                       
        if(targetTemplate == undefined){
            await getConnection().getRepository(Likes).save({
                user_id : user.id,
                template : template
            })

            return res.send({success : true})
        }else{
            return res.send({success : false})
        }

    }catch (error){

      return res.status(500).send();
    }
    
})


router.delete('/:template_id/likes',authentification,async(req,res)=>{
    const authentification : any = (req as any).authentification
    var address: string  = String(authentification.address)

    try{

        let user: Users | undefined = await getConnection().getRepository(Users).findOne({publicAddress: address})
        let template : Templates | undefined = await getConnection().getRepository(Templates)
        .findOne({id : Number(req.params.template_id)})

        let targetTemplate : Likes | undefined = await getConnection().getRepository(Likes)
                                                                            .findOne({template : template,
                                                                                      user_id : user.id})
        // there has been a like in the template                                                                       
        if(targetTemplate != undefined){
            await getConnection().getRepository(Likes).remove(targetTemplate)

            return res.send({success : true})
        }else{
            return res.send({success : false})
        }

    }catch (error){

      return res.status(500).send();
    }
    
})

export default router;