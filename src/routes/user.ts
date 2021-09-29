import express = require("express");
import Web3  = require("web3")
import jwt = require("jsonwebtoken")
import { getConnection } from "typeorm";

import env from "../interfaces/env"
import Wallets from "../databases/entities/wallets" 


var router = express.Router();

router.post('/auth',async(req,res) => {
    try {
        const web3 = new Web3.default(new Web3.default.providers.HttpProvider(env.ETH_NODE))
        const address = web3.eth.accounts.recover(env.AUTH_SIGNATURE, req.body.signature);
        if (address !== req.body.address) {
          return res.status(400).send({auth: false})
        }
    
        let wallet: Wallets | undefined = await getConnection().getRepository(Wallets).findOne({publicAddress: address})
        if (wallet === undefined) {
          wallet = getConnection().getRepository(Wallets).create({
            publicAddress:  address,
            dueBalance:     "0"
          })
          await getConnection().getRepository(Wallets).save(wallet)
        }
    
        const accessToken = jwt.sign({address, id_wallet: wallet.idWallet}, env.JWT_SECRET)
        wallet.signedJwt = accessToken
        await getConnection().getRepository(Wallets).save(wallet)
    
        res.send({auth: true, accessToken});
      }
      catch (error)
      {
        console.error(error);
        return res.status(500).send();
      }
})

export default router;