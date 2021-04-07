 import { Whatsapp } from '../services/whatsapp';
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
  
import { Resolver } from "../services/resolver";
import { Utils } from "../services/utils";

export class WhatsappController {
    public async messageIn(req:Request, res:Response): Promise<void> {
        try {
            var mensajeEntrante = req.body.Body;
             new Whatsapp().replyMessage(mensajeEntrante, req.body.From);
        }
        catch(ex) {
            new Resolver().exception(res, 'Unexpected error.', ex);
        }
    }
    
    public async messageOut(req:Request, res:Response, next:NextFunction): Promise<void> {
         
    }
}