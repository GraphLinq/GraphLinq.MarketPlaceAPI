import express = require("express");
import authentification from "../middlewares/authentification";
import isAdmin from "../middlewares/isAdmin";
import { Request, Response } from "express";
import { getConnection } from "typeorm";
import Templates from "../databases/entities/Templates";
import Likes from "../databases/entities/Likes";
import Favorites from "../databases/entities/Favorites";

var router = express.Router();

router.delete('/templates/:template_id',[authentification,isAdmin],async(req : Request,res : Response)=> {
    try{

        let template : Templates | undefined = await getConnection().getRepository(Templates)
        .findOne({id : Number(req.params.template_id)})

        let likes : Likes[] | undefined = await getConnection().getRepository(Likes)
        .find({template : template})

        let favorites : Favorites[] | undefined = await getConnection().getRepository(Favorites)
        .find({template : template})

        await getConnection().transaction(async tem => {
            await getConnection().getRepository(Templates).delete(template)
            await getConnection().getRepository(Likes).remove(likes)
            await getConnection().getRepository(Favorites).remove(favorites)

        });

        return res.send({success : true})

    }catch(error){
        return res.status(500).send();
    }

});

export default router;
