import { NextFunction, Request, Response } from "express";  
import { Connection, getRepository, Repository } from "typeorm";  
import { Resolver } from '../services/resolver';
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
            else {
                console.log('No se pudo cerrar correctamente el chat'); //updateResult =false; 
            }
 
        }
        catch(ex){
            new Resolver().exception(res, 'Unexpected error.', ex);
        }
    }

    public async updateNetworkCategory(req:Request, res:Response): Promise<void>{
        try{
            console.log(`Agregando NetCategory al id: ${req.body.chatId}`);
            
            const updateNetworkCategory = await getRepository(OpeChats)
            .createQueryBuilder()
            .update(OpeChats)
            .set({networkCategoryId: req.body.networkId})
            .where("id = :id", {id: req.body.chatId})
            .execute();

            if(updateNetworkCategory.affected === 1){
                console.log('Network Category Asignado Correctamente');
                new Resolver().success(res, 'Network Category correctly inserted');
            }
            else{
                console.log('No se pudo actualizar Network Category en OpeChats');
            }

        }
        catch(ex){
            new Resolver().exception(res, 'Unexpected error', ex);
        }
    }
}