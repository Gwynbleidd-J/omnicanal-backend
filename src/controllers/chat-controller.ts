import { NextFunction, Request, Response } from "express";  
import { Connection, getRepository, Repository } from "typeorm";  
import { Resolver } from "../services/resolver";
import { Utils } from "../services/utils"; 
import { OpeChats } from '../models/chat';

export class ChatController {
    public async closeChat(req:Request, res:Response): Promise<void>{
        try{
            console.log('Cerrando chat con id: ');
            console.log(req.body.chatId);
 
            const updatedActiveChats = await getRepository(OpeChats)
                .createQueryBuilder() 
                .update(OpeChats) 
                .set({ statusId: 3}) 
                .where("id = :id", { id: req.body.chatId}) 
                .execute();  
            // console.log(updatedChat); 

            if(updatedActiveChats.affected === 1) { 
                console.log('Chat cerrado correctamente'); //updateResult = true;  
                new Resolver().success(res, 'Chat correctly finished');
            }
            else 
                console.log('No se pudo cerrar correctamente el chat'); //updateResult =false; 
 
        }
        catch(ex){
            new Resolver().exception(res, 'Unexpected error.', ex);
        }
    }
}