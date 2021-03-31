import { Response } from "express";

export class Resolver {
    public async success(res:Response, message:string, data:any = {}): Promise<void>{
        res.status(200).send({ status: 200, message, data });
    }

    public async error(res:Response, message:string, data:any = {}): Promise<void>{
        res.status(401).send({ status: 401, message, data });
    }

    public async notFound(res:Response, message:string, data:any = {}): Promise<void> {
        res.status(404).send({ status: 404, message, data });
    }

    public async exception(res:Response, message:string, data:any = {}): Promise<void> {
        res.status(500).send({ status: 500, message, data });
    }
}