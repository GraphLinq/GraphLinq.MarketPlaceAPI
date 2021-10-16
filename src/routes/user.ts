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

var router = express.Router();

router.post('/auth',async(req,res) => {
    try {

        const web3 = new Web3(new Web3.providers.HttpProvider(env.ETH_NODE))
        const addr = web3.eth.accounts.recover(env.AUTH_SIGNATURE, req.body.signature);
        if (addr !== req.body.address) {
          return res.status(400).send({auth: false})
        }
    
        let user: Users | undefined = await getConnection().getRepository(Users).findOne({publicAddress: addr})
        
        if (user === undefined) {

          user = getConnection().getRepository(Users).create({
            publicAddress:  addr,
          })

          await getConnection().getRepository(Users).save(user)
        }

        const token = jwt.sign({addr, id_wallet: user.id}, env.JWT_SECRET)
        user.token = token
        await getConnection().getRepository(Users).save(user)
        res.send({auth: true, token,id : user.id});
        
      }
      catch (error)
      {
        return res.status(500).send();
      }
})

router.get('/:user_id',async(req,res) => {
  try{

    let user: Users | undefined = await getConnection().getRepository(Users).findOne({id: Number(req.params.user_id)})

    if(user == undefined){
       return res.status(500).send();
    }else{
      res.send({
        name : user.name,
        email : user.email,
      })
    }

  }catch (error){

    return res.status(500).send();
  }
})

router.put('/:user_id/profile/',authentification,async(req,res) => {

      const authentification : any = (req as any).authentification
      var address: string  = String(authentification.addr)

      try{

        let user: Users | undefined = await getConnection().getRepository(Users).findOne({publicAddress: address})
        let user_id:number | undefined=  Number(req.params.user_id)
  
        if(user_id == undefined || user == undefined || user_id != user.id ){
           return res.status(500).send();
        }
        
        user.name = req.body.name
        const errors = await validate(user)

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

          await getConnection().getRepository(Users).save(user)
          return res.send({success : true})
        }

      }catch (error){

        return res.status(500).send();
      }
      
})

router.get('/:user_id/templates/published',async(req,res) => {

  try{
      let user_id : number | undefined = Number(req.params.user_id)

      let user: Users | undefined = await getConnection()
      .getRepository(Users)
      .createQueryBuilder("user")
      .leftJoinAndSelect("user.publishedTemplates", "template")
      .getOne();

      if(user == undefined){
        return res.status(500).send()
      }else{


        return res.send({
          templates :  user.publishedTemplates
        })
      }
      
  }catch (error){

    return res.status(500).send();
  }
  
})

// todo : update after create buy system
router.get('/:user_id/templates/purchased',async(req,res) => {

  try{
      let user_id : number | undefined = Number(req.params.user_id)
      let user: Users | undefined = await getConnection().getRepository(Users).findOne({id: user_id})

      if(user == undefined){
        return res.status(500).send()
      }else{

        var templatesPurchased = Promise.all(user.purchasedTemplates.map(async x => 
          await getConnection().getRepository(Templates).findOne({id : Number(x)})
        ))
  
        return res.send({
          templates : await templatesPurchased
        })
      }

  }catch (error){

    return res.status(500).send();
  }
  
})

router.get('/:user_id/templates/favorites',async(req,res) => {

  try{
      let user_id : number | undefined = Number(req.params.user_id)
      let user: Users | undefined = await getConnection().getRepository(Users).findOne({id: user_id})

      if(user == undefined){
        return res.status(500).send()
      }else{

        var templatesFavorites = await getConnection()
        .getRepository(Favorites)
        .createQueryBuilder("favorite")
        .where("favorite.user_id = :id",{id : user.id})
        .leftJoinAndSelect("favorite.template", "template")
        .getMany();
  
        return res.send({
          templates : templatesFavorites
        })
      }

  }catch (error){

    return res.status(500).send();
  }
  
})

router.get('/:user_id/templates/:template_id',authentification,async(req,res)=>{
  const authentification : any = (req as any).authentification
  var address: string  = String(authentification.addr)

  try{
      let user: Users | undefined = await getConnection().getRepository(Users).findOne({publicAddress: address})
      let template : Templates | undefined =  await getConnection().getRepository(Templates)
      .createQueryBuilder('template')
      .where("template.id = :template_id",{template_id : Number(req.params.template_id)})
      .leftJoinAndSelect("template.user", "user")
      .getOne()

      if(template.user.id == user.id){
          var builder = await getConnection().getRepository(Templates)
          .createQueryBuilder("template")
          .where("template.id =  :id", { id : template.id });

          builder = builder.leftJoinAndSelect("template.category", "category")
          builder = builder.leftJoinAndSelect("template.user", "user")
          builder = builder.leftJoinAndSelect("template.likes", "like")
          builder = builder.leftJoinAndSelect("template.versions", "versions")

          var resultsQuery = await builder.getMany()
          res.send({
              success : true,
              results : resultsQuery
          }) 
      }else{
          return res.status(500).send();    
      }

  }catch(error){
      return res.status(500).send();  
  }
})


export default router;