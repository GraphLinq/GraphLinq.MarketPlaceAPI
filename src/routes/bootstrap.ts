import express = require("express");
import cors = require("cors");
import bodyParser = require("body-parser");


import user from "./user"

class Bootstrap{

    private server: any

    constructor(private host: string, private port: number) { 
    }

    public async init() : Promise<void>{
        return new Promise<void>((resolve) => {
            this.server = express()
            this.server.use(bodyParser.json({limit: '50mb'}))
            this.server.use(cors())    
            this.loadPaths()

            try {
                this.server.listen(this.port, () => {
                    console.log(`⚡️[http]: Server is running at ${this.host}:${this.port}`);
                    resolve()
                })
                } catch(e) { console.error(e) } 
        })
    }

    private loadPaths(){
        this.server.use('/user',user)
    }
}

export default Bootstrap