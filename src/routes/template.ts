import express = require("express");
import { getConnection } from "typeorm";
import Templates from "../databases/entities/Templates" 
import authentification from "../middlewares/authentification";
import Users from "../databases/entities/Users" 
import Likes from "../databases/entities/Likes" 


var router = express.Router();

router.get('/',async(req,res) => {

    try{
        const category: number = Number(req.query.category)
        const page : number = Number(req.query.page)
        const limit : number = Number(req.query.limit)
        const sort : number = Number(req.query.sort)

        if( page == undefined || limit == undefined){
            return res.status(500).send()
        }
    
        var builder = await getConnection().getRepository(Templates)
        .createQueryBuilder('template')
        
    
        if(category != undefined){
            builder = builder.where("template.category_id = :filter",{filter : category})
        }
    
        builder = builder.offset((page - 1) * limit).limit(limit)

        if(sort != undefined){
             
            // todo : make this more dynamic after / for test
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

        var resultsQuery = await builder.getMany()
        res.status(200).send({
            results : resultsQuery
        })

    }catch (error)
    {
      console.error(error);
      return res.status(500).send();
    }
    
})

router.post('/:template_id/likes',authentification,async(req,res)=>{
    const authentification : any = (req as any).authentification
    var address: string  = String(authentification.address)

    try{

        let target: Users | undefined = await getConnection().getRepository(Users).findOne({publicAddress: address})
        let likeTemplate : Likes | undefined = await getConnection().getRepository(Likes)
                                                                            .findOne({template_id : Number(req.params.template_id),
                                                                                      user_id : target.id})
        // there has not yet been a like in the template                                                                       
        if(likeTemplate == undefined){
            await getConnection().getRepository(Likes).save({
                template_id : Number(req.params.template_id),
                user_id : target.id
            })

            return res.status(200).send({success : true})
        }else{
            return res.status(500).send()
        }

    }catch (error){

      return res.status(500).send();
    }
    
})


router.delete('/:template_id/likes',authentification,async(req,res)=>{
    const authentification : any = (req as any).authentification
    var address: string  = String(authentification.address)

    try{

        let target: Users | undefined = await getConnection().getRepository(Users).findOne({publicAddress: address})
        let likeTemplate : Likes | undefined = await getConnection().getRepository(Likes)
                                                                            .findOne({template_id : Number(req.params.template_id),
                                                                                      user_id : target.id})
        // there has not yet been a like in the template                                                                       
        if(likeTemplate != undefined){
            await getConnection().getRepository(Likes).remove(likeTemplate)

            return res.status(200).send({success : true})
        }else{
            return res.status(500).send()
        }

    }catch (error){

      return res.status(500).send();
    }
    
})

export default router;