import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { CatUsers } from '../models/user'; 
import { CatRols } from './../models/rol';
import { Resolver } from '../services/resolver';
import { Utils } from "../services/utils";
import { CatAuxiliarStatuses } from '../models/auxiliarStatus';
import { OpeChats } from '../models/chat';


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
            /*
            en éste método necesito poner las relaciones de las distintas tablas
            con el having de typeorm para que los campos:
                public string solvedChats { get; set; }
                public string activeChats { get; set; }
                public string solvedCalls { get; set; }
                public string activeCalls { get; set; }
                public string score { get; set; }
                public string status { get; set; }
                puedan ser guardados
            Usando el repositorio
            Usando el QueryBuilder
            */

            console.log('Consultando los agentes acargo de un supervisor');
            const agent = await getRepository(CatUsers)
            .createQueryBuilder("user")
            .leftJoinAndSelect("user.rol", "rol")
            .leftJoinAndSelect("user.status", 'status')
            .where("user.ID= :id",{id: req.body.id})
            .getMany();

            let payload ={
                details:agent
            }; 
            if(agent){
                new Resolver().success(res, 'Agent detail correctly consulted', payload); //payload
            }
            else{
                new Resolver().error(res, 'Something bad with agents info.');
            }
        }
        catch(ex) 
        {
            console.log('Error[getUsers]: ' + ex); 
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
            console.log(`Error[updateUserActiveIp ${ex}`);
        }
    }

    public async updateActiveChats(req:Request, res:Response): Promise<void>{
        try{
            console.log(`Actualizando el campo Active Chats`);
            const activeChats = await getRepository(OpeChats)
            .createQueryBuilder("chat")
            .leftJoinAndSelect("chat.userId", "user")
            .update(CatUsers)
            //leftJoinAndSelect("chat.userId", "user")
            //.update(CatUsers)
            //.set({activeChats: 1})
           .set({activeChats: ()=> "OpeChats.activeChats+1"})
            .where("chat.userId = :id", {id: req.body.id})
            .andWhere("chat.statusId = :status", {status:3})
            .execute();

            if(activeChats.affected === 1){
                console.log('campo activeIp actualizado correctamente');
                new Resolver().success(res, 'activeIp Correctly modified');
            }
            else{
                console.log('No se puedo actualizar correctamente activeIp');
            }
        }
        catch(ex){
            console.log(`Error[updateActiveChats] ${ex}`);
        }
    }

    public async updateSolvedChats(req:Request, res:Response): Promise<void>{
        try{
            console.log(`Actualizando el campo solvedChats`)
            const solvedChats = await getRepository(OpeChats)
            .createQueryBuilder("chat")
            .leftJoinAndSelect("chat.userId", "chat")
            .update(CatUsers)
            .set({activeChats:1})
           // .set({activeChats: ()=> "OpeChats.activeChats+1"})
            .where("chat.id = :id", {id: req.body.id})
            .andWhere("user.status = :status", {status:2})
            .execute();

            if(solvedChats.affected === 1){
                console.log('campo activeIp actualizado correctamente');
                new Resolver().success(res, 'activeIp Correctly modified');
            }
            else{
                console.log('No se puedo actualizar correctamente activeIp');
            }
        }
        catch(ex){
            console.log(`Error[updateSolvedChats] ${ex}`);
        }
    }

    public async updateActiveCalls(req:Request, res:Response): Promise<void>{
        try{
            console.log(`Actualizando el campo updateActiveCalls`);
        }
        catch(ex){
            console.log(`Error[updateActiveCalls]${ex}`)
        }
    }

    public async updateSolvedCalls(req:Request, res:Response): Promise<void>{
        try{

        }
        catch(ex){
            console.log(`Error[updateSolvedCalls] ${ex}`)
        }
    }
}

/*             
if(users)
{  
console.log(users);
payload = {
    users: users 
};    
console.log(payload);
new Resolver().success(res, 'Agents correctly consulted', payload); 
}
else {
new Resolver().error(res, 'Something bad with agents info.'); 
} */

            ////Estructura de la clase en la aplicacion
            // // public string name { get; set; }
            // // public string solvedChats { get; set; }
            // // public string activeChats { get; set; }
            // // public string solvedCalls { get; set; }
            // // public string activeCalls { get; set; }
            // // public string score { get; set; }
            // // public string status { get; set; }