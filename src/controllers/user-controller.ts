import { Request, Response } from "express";
import { getRepository, createConnection, QueryBuilder, Brackets, getConnection, getManager } from 'typeorm';
import { CatUsers } from '../models/user'; 
import { CatRols } from './../models/rol';
import { Resolver } from '../services/resolver';
import { Utils } from "../services/utils";
import { CatAuxiliarStatuses } from '../models/auxiliarStatus';
import { OpeChats } from '../models/chat';
import { DeactivationsList } from "twilio/lib/rest/messaging/v1/deactivation";
import { CatComunicationStatuses } from "../models/comunicationStatus";
import { OpeCalls } from '../models/call';

export class UserController {
    public async register(req:Request, res:Response): Promise<void> {
        try { 
            req.body.password = await new Utils().encrypt(req.body.password);
            getRepository(CatUsers).save(req.body)
                .then(result => new Resolver().success(res, 'Register succesfull', result))
                .catch(error => new Resolver().error(res, 'Register error', error));
        }
        catch(ex) {
            new Resolver().exception(res, 'Unexpected error.', ex);
        }
    }

    public async getUsers(req:Request, res:Response): Promise<void> {
        try{ 
            console.log('Consultando a los agentes del supervisor con ID: ');
            console.log(req.body.leaderId);
            const users = await getRepository(CatUsers) 
                .createQueryBuilder("users")  
                .where("users.leaderId = :leaderId", {leaderId: req.body.leaderId}) 
                //.andWhere("users.rolID = :rolId", {rolId: 1}) //El rolId 1  hace refrerencia al rol de Agente[Después habría que diferenciar cada rol en la petición] 
                .orderBy("users.name", "ASC") 
                .getMany(); 


            // const users = await getRepository(CatUsers);


            let payload; 

            if(users)
            {
                payload = {
                    users: users 
                };    
                console.log(payload);
                new Resolver().success(res, 'Agents correctly consulted', payload); 
            }
            else 
                new Resolver().error(res, 'Something bad with agents info.'); 
        }
        catch(ex) 
        {
            console.log('Error[getUsers]: ' + ex); 
        }
    }
    
    public async getUserDetail(req:Request, res:Response): Promise<void> {
        try{ 
            console.log(`Consultado el detalle del agente con ID:${req.body.userI}`);
            
            const details = await getRepository(CatUsers)
            .createQueryBuilder("user")
            .leftJoin("user.chat", "chat")
            .leftJoinAndSelect("user.status", "status")
            .leftJoinAndSelect("user.rol", "rol")
            //.select(["user.name, user.paternalSurname, user.maternalSurname"])
            .where("user.ID = :id",{id: req.body.userId})
            .getOne();
            
            const solvedChats = await getRepository(CatUsers)
            .createQueryBuilder("user")
            .innerJoin("user.chat", "chat")
            .select(["COUNT (chat.statusId) AS solvedChats"])
            .where("user.ID = :id",{id: req.body.userId})
            .andWhere("chat.statusId = :statusId", {statusId: 3})
            .getRawOne();

            const activeChats = await getRepository(CatUsers)
            .createQueryBuilder("user")
            .innerJoin("user.chat", "chat")
            .select(["COUNT (chat.statusId) AS activeChats"])
            .where("user.ID = :id",{id: req.body.userId})
            .andWhere("chat.statusId = :statusId", {statusId: 2})
            .getRawOne();

            const solvedCalls = await getRepository(CatUsers)
            .createQueryBuilder("user")
            .innerJoin("user.call", "call")
            .select(["COUNT (call.statusId) AS solvedCalls"])
            .where("user.ID = :id",{id: req.body.userId})
            .andWhere("call.statusId = :statusId", {statusId: 3})
            .getRawOne();

            const activeCalls = await getRepository(CatUsers)
            .createQueryBuilder("user")
            .innerJoin("user.call", "call")
            .select(["COUNT (call.statusId) AS activeCalls"])
            .where("user.ID = :id",{id: req.body.userId})
            .andWhere("call.statusId = :statusId", {statusId: 2})
            .getRawOne();

           
            
  
            let payload ={
                details,                 
                solvedChats,
                activeChats,
                solvedCalls,
                activeCalls
            }
 
            
            if(payload){
                new Resolver().success(res, 'Agent detail correctly consulted', payload); //payload
            }
            else{
                new Resolver().error(res, 'Something bad with agents info.');
            }
        }
        catch(ex) 
        {
            console.log('Error[getUsersDetails]: ' + ex); 
        }

        
    }

    public async updateUserActiveIp(req:Request, res:Response): Promise<void>{
        try{
            console.log('Actualizando el campo ActiveIp del Usuario')
            const activeIp = await getRepository(CatUsers)
            .createQueryBuilder()
            .update(CatUsers)
            .set({activeIp: req.body.ipAddress})
            .where("email = :email",{email:req.body.email})
            .execute();

            if(activeIp.affected === 1){
                console.log('campo activeIp actualizado correctamente');
                new Resolver().success(res, 'activeIp Correctly modified');
            }
            else{
                console.log('No se puedo actualizar correctamente activeIp');
            }
        }
        catch(ex){
            console.log(`Error updateUserActiveIp ${ex}`);
        }
    }

    public async updateMaxActiveChats(req:Request, res:Response): Promise<void>{
        try{
            console.log('Actualizando el campo MaxActiveChats del Usuario')
            const maxActiveChats = await getRepository(CatUsers)
            .createQueryBuilder()
            .update(CatUsers)
            .set({maxActiveChats: req.body.maxActiveChats})
            .where("ID = :id",{id:req.body.id})
            .execute();

            if(maxActiveChats.affected === 1){
                console.log('campo maxActiveChats actualizado correctamente');
                new Resolver().success(res, 'maxActiveChat Correctly modified');
            }
            else{
                console.log('No se pudo actualizar correctamente maxActiveChats');
            }
        }
        catch(ex){
            console.log(`Error[updateMaxActiveChats ${ex}`);
        }
    }

}
