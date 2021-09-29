import express = require("express");
import Web3  from "web3"
import jwt = require("jsonwebtoken")
import { getConnection } from "typeorm";
import {validate} from "class-validator";
import env from "../interfaces/env"
import Users from "../databases/entities/Users" 
import authentification from "../middlewares/authentification";

var router = express.Router();

router.post('/auth',async(req,res) => {
    try {

        const web3 = new Web3(new Web3.providers.HttpProvider(env.ETH_NODE))
        const address = web3.eth.accounts.recover(env.AUTH_SIGNATURE, req.body.signature);
        if (address !== req.body.address) {
          return res.status(400).send({auth: false})
        }
    
        let user: Users | undefined = await getConnection().getRepository(Users).findOne({publicAddress: address})
        
        if (user === undefined) {

          user = getConnection().getRepository(Users).create({
            publicAddress:  address,
          })

          await getConnection().getRepository(Users).save(user)
        }

        const token = jwt.sign({address, user_id: user.id}, env.JWT_SECRET)
        user.token = token
        await getConnection().getRepository(Users).save(user)
        res.send({auth: true, token});
        
      }
      catch (error)
      {
        console.error(error);
        return res.status(500).send();
      }
})

router.put('/profile/:user_id',authentification,async(req,res) => {
      const authentification : any = (req as any).authentification
      var address: string  = String(authentification.address)

      try{

        let user: Users | undefined = await getConnection().getRepository(Users).findOne({publicAddress: address})
        let user_id:number | undefined=  Number(req.params.user_id)
  
        if(user_id == undefined || user == undefined || user_id != user.id ){
           return res.status(500).send();
        }
        
        user.name = req.body.name
        const errors = await validate(user)
        if(errors.length > 0){
          return res.status(500).send({
            "errors" : errors.map(x => 
             ({
                name : x.property,
                messages  : x.constraints
              })
            )
          })
          
        }else{
          return res.send({success : true})
        }

      }catch (error){

        return res.status(500).send();
      }
      
})

export default router;