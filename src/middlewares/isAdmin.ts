import jwt  from "jsonwebtoken"
import env from "../interfaces/env"
import { getConnection } from "typeorm";
import Users from "../databases/entities/Users";


const isAdmin = async(req: any, res: any, next: any) => {

    try{
        const authentification : any = (req as any).authentification
        var address: string  = String(authentification.address)
        if (address) {
            var address: string  = String(authentification.address)
            let user: Users | undefined = await getConnection().getRepository(Users).findOneOrFail(
                { where : {publicAddress : address},select: ["is_admin"] }
            )
            if(user.is_admin == true)
                next();
            else{
                res.sendStatus(403);  
            }
                
            } else {
            res.sendStatus(403);
        }
    }catch(error){
        res.sendStatus(401);
    }
    
};

export default isAdmin;