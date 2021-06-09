import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { CatUsers } from "../models/user"; 
import { CatRols } from './../models/rol';
import { Resolver } from '../services/resolver';
import { Utils } from "../services/utils";
import { CatAuxiliarStatuses } from '../models/auxiliarStatus';


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
            //Usando el repositorio

            ////Estructura de la clase en la aplicacion
            // // public string name { get; set; }
            // // public string solvedChats { get; set; }
            // // public string activeChats { get; set; }
            // // public string solvedCalls { get; set; }
            // // public string activeCalls { get; set; }
            // // public string score { get; set; }
            // // public string status { get; set; }


            let payload = { 
                name: req.body.id,  
                 solvedChats:2, 
                activeChats:2,  
                solvedCalls:2,  
                 activeCalls:2,  
                 score:1,
                 status:'estatus'
            }
            // const userRepository = getRepository(CatUsers);
            // const users = await userRepository.find({ relations: ["rol"] });

            
            ///Usando el QueryBuilder
            console.log('Consultando los agentes de un agente');
            const users = await getRepository(CatUsers)
            .createQueryBuilder("user")
            .leftJoinAndSelect("user.rol", "rol") 
            .getMany();
 

            if(users){
                new Resolver().success(res, 'Agents correctly consulted', payload); 
            }
            else{
                new Resolver().error(res, 'Something bad with agents info.');
            }
/*             if(users)
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
        }
        catch(ex) 
        {
            console.log('Error[getUsers]: ' + ex); 
        }
    }
  
}