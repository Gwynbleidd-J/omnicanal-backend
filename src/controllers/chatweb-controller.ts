import { Resolver } from '../services/resolver';
import { NextFunction, Request, Response } from "express";
import { Socket } from '../services/socket';

export class ChatWebController{
    public SendMessageToClient(req:Request, res:Response){

        try{
            //METODO GET EN EL ARCHIVO DE ROUTING
                //res.send(this.dasd(req.body))
        }
        catch(ex){
            new Resolver().exception(res, 'Unexpected error.', ex);
        }
    }

    public ReceiveMessageToClient(req:Request, res:Response){
        try{
            let data = req.body;
            console.log(data);
            res.status(200).json(data);
        }
        catch(ex){
            new Resolver().exception(res, 'Unexpected error.', ex);
        }
    }
}