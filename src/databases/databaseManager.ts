import "reflect-metadata";
import { createConnection } from "typeorm";

export default class DatabaseManager{
    constructor(private host: string, private port: number,
        private user: string, private pwd: string, private type: string,
        private db_name: string)
    {

    }

    init(): Promise<void>
    {
        return new Promise((res) => {
            createConnection({
                type: this.type as any,
                host: this.host,
                port: this.port,
                username: this.user,
                password: this.pwd,
                database: this.db_name,
                entities: [
                    "./dist/databases/entities/*.js"
                ],
                synchronize: true,
                logging: false
            }).then(() => {
                console.log(`⚡️[db]: Database is connected and loaded at ${this.host}:${this.port} (${this.db_name}:${this.type})`);
                res()
            }).catch(error => console.log(error));
        });
    }
}