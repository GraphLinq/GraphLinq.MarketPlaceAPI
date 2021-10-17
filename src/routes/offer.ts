import express = require("express");
import Web3  from "web3"
import jwt = require("jsonwebtoken")
import { getConnection } from "typeorm";
import {validate} from "class-validator";
import env from "../interfaces/env"
import Users from "../databases/entities/Users" 
import authentification from "../middlewares/authentification";
import Templates from "../databases/entities/Templates";
import Favorites from "../databases/entities/Favorites";
import Offer from "../databases/entities/Offers";
import Offers from "../databases/entities/Offers";

var router = express.Router();

router.post('/',authentification,async(req,res) => {
    
    const authentification : any = (req as any).authentification
    var address: string  = String(authentification.addr)

    try{
        let user: Users | undefined = await getConnection().getRepository(Users).findOne({publicAddress: address})

        let offer = new Offer()
        offer.title = req.body.title
        offer.description = req.body.description
        offer.budget = req.body.budget
        offer.email = req.body.email
        offer.user = user

        const errors = await validate(offer)
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
          //we insert the version request with the cascade system
          await getConnection().getRepository(Offer).save(offer)
          return res.send({success : true})
        }

    }catch(error){

        return res.status(500).send();
    }
})

router.get('/',async(req,res) => {

    try{
        const page : number | undefined  = Number(req.query.page)
        const limit : number | undefined  = Number(req.query.limit)

        if( page == undefined || limit == undefined){
            return res.status(500).send()
        }
    
        var builder = await getConnection().getRepository(Offers)
        .createQueryBuilder('offer')
        
        builder = builder.offset((page - 1) * limit).limit(limit)

        
        builder = builder.leftJoinAndSelect("offer.user", "user")

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



router.get('/:offer_id',async(req,res) => {

    try{
        let offer_id:number | undefined=  Number(req.params.offer_id)

    
        var builder = await getConnection().getRepository(Offers)
        .createQueryBuilder('offer')
        .where("offer.id = :id",{id : offer_id})


        
        builder = builder.leftJoinAndSelect("offer.user", "user")

        var resultsQuery = await builder.getOne()
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
export default router;