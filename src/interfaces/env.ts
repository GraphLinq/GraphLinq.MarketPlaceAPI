interface EnvInterface {
    SERVER_HOST: string,
    SERVER_PORT: number,
    JWT_SECRET : string,
    AUTH_SIGNATURE : string,
    ETH_NODE : string,

    DB_HOST: string,
    DB_PORT: number,
    DB_USER: string,
    DB_PWD: string,
    DB_TYPE: string,
    DB_NAME: string,

    
}

export default (process.env as any) as EnvInterface