import { NextFunction, Request, Response } from "express";  
import { Connection, getRepository, Repository } from "typeorm";  
import { Resolver } from '../services/resolver';
import { Utils } from "../services/utils"; 
import { OpeChats } from '../models/chat';
import  {CatUsers}  from '../models/user';
import { Console } from "console";

export class ChatController {
    public async closeChat(req:Request, res:Response): Promise<void>{
        try{
            console.log(`Cerrando chat con id: ${req.body.chatId}` );
 
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

    public async subtractActiveChat(req:Request, res:Response): Promise<void>{
        try{
            const actualActiveChats =await getRepository(CatUsers)
            .createQueryBuilder("user")
            .where("user.ID = :id", {id: req.body.userId})
            .getOne();
            
            let actualActiveChatsCuantity:any;
            if(actualActiveChats){
                actualActiveChatsCuantity = {
                    actualActiveChats: actualActiveChats.activeChats
                }
                actualActiveChatsCuantity['actualActiveChats'] = actualActiveChatsCuantity['actualActiveChats'] - 1;
            }
            
            if(actualActiveChatsCuantity['actualActiveChats'] >= 0){
                const subtractActiveChats = await getRepository(CatUsers)
                .createQueryBuilder()
                .update(CatUsers)
                .set({activeChats: actualActiveChatsCuantity['actualActiveChats']})
                .where("ID = :id", { id: req.body.userId})
                .execute();
                
                if(subtractActiveChats.affected === 1){
                    //console.log('Campo activeChats modificado correctamente')
                    new Resolver().success(res, 'ActiveChat correctly modified');
                }
                else{
                    console.log('No se pudo modificar correctamente el campo ActiveChats');

                }
            }
            else{
                console.log(`El agente no tiene chats asignados`)
                new Resolver().success(res, 'ActiveChat has zero value')
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