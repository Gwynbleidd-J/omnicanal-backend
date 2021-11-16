import { Request, Response } from "express";  
import { Resolver } from '../services/resolver';

export class PruebaController{

    public async Prueba(req:Request, res:Response): Promise<void>{
        try{
            console.log('Body:'+ req.body);
            new Resolver().success(res, 'Users correctly consulted');
        }
        catch(ex)
        {
            console.log(`${ex}`);
        }
    }
}