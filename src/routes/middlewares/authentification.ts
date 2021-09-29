import jwt  from "jsonwebtoken"
import env from "../../interfaces/env"

const authentification = (req: any, res: any, next: any) => {

    const autorization = req.headers.authorization;

    if (autorization) {
        const token = autorization.split(' ')[1];
        jwt.verify(token, env.JWT_SECRET, (err: any) => {
            if (err) {
                return res.sendStatus(403);
            }
            next();
        });
    } else {
        res.sendStatus(401);
    }
};

export default authentification;