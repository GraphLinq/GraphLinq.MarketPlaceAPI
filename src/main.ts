import dotenv = require("dotenv");
import server from "./routes/bootstrap"
import env from "./interfaces/env"
import Bootstrap from "./routes/bootstrap";
import Database from "./databases/databaseManager"
import DatabaseManager from "./databases/databaseManager";

( async () =>{

    dotenv.config()

    const database: DatabaseManager = new DatabaseManager(env.DB_HOST, env.DB_PORT, 
        env.DB_USER, env.DB_PWD, env.DB_TYPE, env.DB_NAME) 

    await database.init()


    const server: Bootstrap = new Bootstrap(env.SERVER_HOST, env.SERVER_PORT)
    await server.init()

    console.log(`⚡️[logs]: GraphLinq API ready to receive incoming requests`)
})();