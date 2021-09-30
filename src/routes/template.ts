import express = require("express");
import { getConnection } from "typeorm";
import Templates from "../databases/entities/Templates" 


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
            }// price hight -> lo<
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


export default router;