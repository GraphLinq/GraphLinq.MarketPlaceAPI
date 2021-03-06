import express = require("express");
import { getConnection, SimpleConsoleLogger } from "typeorm";
import Templates from "../databases/entities/Templates" 
import authentification from "../middlewares/authentification";
import Users from "../databases/entities/Users" 
import Likes from "../databases/entities/Likes" 
import Categories from "../databases/entities/Categories";
import {validate} from "class-validator";
import { UniqueMetadataArgs } from "typeorm/metadata-args/UniqueMetadataArgs";
import Favorites from "../databases/entities/Favorites";
import TemplatesVersion from "../databases/entities/TemplatesVersions";
import {marketProvider} from "../providers/forwadingContract"
import TemplatesAssets from "../databases/entities/TemplatesAssets";

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
        builder = builder.leftJoinAndSelect("template.versions", "versions")
        builder = builder.leftJoinAndSelect("template.assets", "assets")

        var resultsQuery = await builder.getMany()
        resultsQuery.map(template => {
            if(template.assets === undefined)
              template.assets = []
              if(template.youtube !== ""){
                template.assets.unshift({
                  type : "youtube",
                  data : template.youtube,
                  id : -1,
                  template : null
                })
            }
        })

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
    var address: string  = String(authentification.addr)

    try{
        let user: Users | undefined = await getConnection().getRepository(Users).findOne({publicAddress: address})


        let template = new Templates()
        template.name = req.body.name
        template.description = req.body.description
        template.template_cost = req.body.price
        template.youtube = req.body.youtube
        template.user = user
        template.category = await getConnection().getRepository(Categories).findOne({id : req.body.category_id})
        template.is_published = false
        var assets: TemplatesAssets[] = []
        req.body.images.forEach((value: string) => {
            var asset:TemplatesAssets = new  TemplatesAssets 
            asset.type = "image"
            asset.data = value
            assets.push(asset)
        });
        template.assets = assets
        var first_version = new TemplatesVersion
        first_version.raw_bytes = req.body.data // todo : check with the api if the data works and is executed correctly
        first_version.current_version = "1.0.0"
        first_version.execution_cost =  0.0 // todo : get the cost with api
        first_version.template = template
        template.versions = [first_version]

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
          //we insert the version request with the cascade system
          await getConnection().getRepository(Templates).save(template)
          return res.send({success : true, templateId : template.id})
        }

    }catch(error){
        console.log(error)
        return res.status(500).send();
    }
})

router.post('/:template_id/versions',authentification,async(req,res)=>{

    const authentification : any = (req as any).authentification
    var address: string  = String(authentification.addr)
    try{
        let user: Users | undefined = await getConnection().getRepository(Users).findOne({publicAddress: address})
        let template : Templates | undefined =  await getConnection().getRepository(Templates)
        .createQueryBuilder('template')
        .where("template.id = :template_id",{template_id : Number(req.params.template_id)})
        .leftJoinAndSelect("template.user", "user")
        .getOne()

        if(template.user.id != user.id){
            return res.status(500).send();
        }

        var new_version = new TemplatesVersion
        new_version.raw_bytes = req.body.data // todo : check with the api if the data works and is executed correctly
        new_version.current_version = req.body.current_version 
        new_version.execution_cost =  0.0 // todo : get the cost with api
        new_version.template = template
        const errors = await validate(new_version)

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

          await getConnection().getRepository(TemplatesVersion).save(new_version)
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
        builder = builder.leftJoinAndSelect("template.versions", "versions")
        builder = builder.leftJoinAndSelect("template.assets", "assets")

        var resultsQuery = await builder.getMany()
        resultsQuery.map(template => {
            if(template.assets === undefined)
              template.assets = []
              if(template.youtube !== ""){
                template.assets.unshift({
                  type : "youtube",
                  data : template.youtube,
                  id : -1,
                  template : null
                })
            }
        })

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

router.post('/:template_id/likes',authentification,async(req,res)=>{
    const authentification : any = (req as any).authentification
    var address: string  = String(authentification.addr)

    try{

        let user: Users | undefined = await getConnection().getRepository(Users).findOne({publicAddress: address})
        let template : Templates | undefined = await getConnection().getRepository(Templates)
                                                                    .findOne({id : Number(req.params.template_id)})

        let targetLike : Likes | undefined = await getConnection().getRepository(Likes)
                                                                            .findOne({template : template,
                                                                                      user_id : user.id})
        // there has not yet been a like in the template                                                                       
        if(targetLike == undefined){
            await getConnection().getRepository(Likes).save({
                user_id : user.id,
                template : template
            })

            return res.send({success : true})
        }else{
            return res.send({success : false})
        }

    }catch (error){

      console.log(error)
      return res.status(500).send();
    }
    
})


router.delete('/:template_id/likes',authentification,async(req,res)=>{
    const authentification : any = (req as any).authentification
    var address: string  = String(authentification.addr)

    try{

        let user: Users | undefined = await getConnection().getRepository(Users).findOne({publicAddress: address})
        let template : Templates | undefined = await getConnection().getRepository(Templates)
        .findOne({id : Number(req.params.template_id)})

        let targetLike : Likes | undefined = await getConnection().getRepository(Likes)
                                                                            .findOne({template : template,
                                                                                      user_id : user.id})
        // there has been a like in the template                                                                       
        if(targetLike != undefined){
            await getConnection().getRepository(Likes).remove(targetLike)

            return res.send({success : true})
        }else{
            return res.send({success : false})
        }

    }catch (error){

      console.log(error)
      return res.status(500).send();
    }
    
})


router.post('/:template_id/favorites',authentification,async(req,res)=>{
    const authentification : any = (req as any).authentification
    var address: string  = String(authentification.addr)

    try{

        let user: Users | undefined = await getConnection().getRepository(Users).findOne({publicAddress: address})
        let template : Templates | undefined = await getConnection().getRepository(Templates)
                                                                    .findOne({id : Number(req.params.template_id)})

        let targetFavorite : Favorites | undefined = await getConnection().getRepository(Favorites)
                                                                            .findOne({user_id : user.id,
                                                                                      template : template})
        // there has not yet been a like in the template                                                                       
        if(targetFavorite == undefined){
            await getConnection().getRepository(Favorites).save({
                user_id : user.id,
                template : template
            })

            return res.send({success : true})
        }else{
            return res.send({success : false})
        }

    }catch (error){
      console.log(error)
      return res.status(500).send();
    }
    
})


router.delete('/:template_id/favorites',authentification,async(req,res)=>{
    const authentification : any = (req as any).authentification
    var address: string  = String(authentification.addr)

    try{

        let user: Users | undefined = await getConnection().getRepository(Users).findOne({publicAddress: address})
        let template : Templates | undefined = await getConnection().getRepository(Templates)
                                                                    .findOne({id : Number(req.params.template_id)})

        let targetFavorite : Favorites | undefined = await getConnection().getRepository(Favorites)
                                                                            .findOne({user_id : user.id,
                                                                                      template : template})
        // there has not yet been a like in the template                                                                       
        if(targetFavorite != undefined){
            await getConnection().getRepository(Favorites).remove(targetFavorite)

            return res.send({success : true})
        }else{
            return res.send({success : false})
        }

    }catch (error){

      console.log(error)
      return res.status(500).send();
    }
    
})


router.get('/:template_id/:version/download',authentification,async(req,res)=>{
    const authentification : any = (req as any).authentification
    var address: string  = String(authentification.addr)
    try{
        
        let template: Templates | undefined = await getConnection()
        .getRepository(Templates)
        .createQueryBuilder("template")
        .leftJoinAndSelect("template.versions", "versions")
        .addSelect('versions.raw_bytes')
        .where("template.id = :id",{id : Number(req.params.template_id)})
        .getOne();

        // todo: very dirty refactor this after ... 
        if(parseInt(template.template_cost) == 0){
            let templateVersion  : TemplatesVersion | undefined =  template.versions.
                                    find(x=> x.id == Number(req.params.version))
            
            if(templateVersion == undefined){
                return res.status(500).send({success : false});  
            }else{
                res.send({
                    success : true,
                    results : templateVersion.raw_bytes
                })
            }

            return;
        }

        let userData: Users | undefined = await getConnection()
        .getRepository(Users)
        .createQueryBuilder("user")
        .where("user.publicAddress = :publicAddress",{publicAddress : address})
        .leftJoinAndSelect("user.purchasedTemplates", "purchased")
        .leftJoinAndSelect("purchased.template", "template")
        .getOne();


        // the user has not bought the template
        if(userData.purchasedTemplates === undefined || 
                !userData.purchasedTemplates.find(purchased  => purchased.template.id ===  Number(req.params.template_id))){
                return res.status(500).send();  
        }else{

            let templateVersion  : TemplatesVersion | undefined =  template.versions.
                                    find(x=> x.id == Number(req.params.version))
            
            if(templateVersion == undefined){
                return res.status(500).send({success : false});  
            }else{
                res.send({
                    success : true,
                    results : templateVersion.raw_bytes
                })
            }
        }
        
    }catch(error){
        console.log(error)
        return res.status(500).send();  
    }
})


router.put('/:template_id/publish',authentification,async(req,res)=>{
    try{
        let template : Templates | undefined =  await getConnection().getRepository(Templates)
        .createQueryBuilder('template')
        .where("template.id = :template_id",{template_id : Number(req.params.template_id)})
        .leftJoinAndSelect("template.user", "user")
        .leftJoinAndSelect("template.category", "category")
        .leftJoinAndSelect("template.versions", "versions")
        .addSelect('versions.raw_bytes')
        .addSelect('versions.created_at')
        .addSelect('versions.updated_at')
        .getOne()

        template.is_published = true
        await getConnection().getRepository(Templates).save(template)
        res.send({reponse:"success"})
    }catch(error){
        res.status(500).send()
    }
    
});
router.put('/:template_id/edit',authentification,async(req,res)=>{
    const authentification : any = (req as any).authentification
    var address: string  = String(authentification.addr)

    try{
        let user: Users | undefined = await getConnection().getRepository(Users).findOne({publicAddress: address})
        let template : Templates | undefined =  await getConnection().getRepository(Templates)
        .createQueryBuilder('template')
        .where("template.id = :template_id",{template_id : Number(req.params.template_id)})
        .leftJoinAndSelect("template.user", "user")
        .leftJoinAndSelect("template.category", "category")
        .leftJoinAndSelect("template.versions", "versions")
        .addSelect('versions.raw_bytes')
        .addSelect('versions.created_at')
        .addSelect('versions.updated_at')
        .getOne()

        if(template.user.id == user.id){
          
            template.name = req.body.name
            template.description = req.body.description
            template.template_cost = req.body.template_cost
            template.user = user
            template.category = await getConnection().getRepository(Categories).findOne({id : req.body.category_id})

    
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
                var template_version = template.versions.find( x => x.id == Number(req.body.version_id))
                if(req.body.data.trim().length > 0){
                   template_version.raw_bytes = req.body.data 
                }
                          
                template_version.execution_cost =  0.0 // todo : get the cost with api
                
                const errors = await validate(template_version)
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

                    await getConnection().getRepository(TemplatesVersion).save(template_version)
                    await getConnection().getRepository(Templates).save(template)
                    return res.send({success : true})
                }                
            }

        }else{
            return res.status(500).send();    
        }
  
    }catch(error){
        console.log(error)
        return res.status(500).send();  
    }
})

router.get('/:template_id',async(req,res)=>{

    try{
  
        var builder = await getConnection().getRepository(Templates)
        .createQueryBuilder("template")
        .where("template.id =  :id", { id : Number(req.params.template_id) });

        builder = builder.leftJoinAndSelect("template.category", "category")
        builder = builder.leftJoinAndSelect("template.user", "user")
        builder = builder.leftJoinAndSelect("template.likes", "like")
        builder = builder.leftJoinAndSelect("template.versions", "versions")
        builder = builder.leftJoinAndSelect("template.assets", "assets")

        var resultsQuery = await builder.getOne()
        
        
        if(resultsQuery.assets === undefined)
            resultsQuery.assets = []
            if(resultsQuery.youtube !== ""){
                resultsQuery.assets.unshift({
                type : "youtube",
                data : resultsQuery.youtube,
                id : -1,
                template : null
            })
        }
        

        res.send({
            success : true,
            results : resultsQuery
        }) 

  
    }catch(error){
        console.log(error)
        return res.status(500).send();  
    }
  })
  
export default router;