import { Request, Response } from "express";  
import { getRepository } from "typeorm";
import { CatSoftphoneParameters } from '../models/softphoneParameters';
import { Resolver } from '../services/resolver';
import { CatAppParameters } from '../models/appParameters';
import { CatUsers } from '../models/user';

export class ParametersController{

    public async SoftphoneParameters(req:Request, res:Response ): Promise <void>{
        try{            
            console.log(`Cambiando parametros del softphone con id: ${req.body.id}`);
            const user = await getRepository(CatSoftphoneParameters)
            .createQueryBuilder()
            .update(CatSoftphoneParameters)
            .set({
                userName: req.body.userName,
                password: req.body.password,
                domain: req.body.domain,
                displayName: req.body.displayName,
                authName: req.body.authName,
                server: req.body.server,
                port: req.body.port
            })
            .where("id = :id", {id: req.body.id})
            .execute();
            
            if(user.affected ===1){
                console.log(`Parametros del softphone cambiados exitosamente`);
                new Resolver().success(res, 'softphone parameters correctly changed');
            }
            else{
                console.log('No se pudieron cambiar correctamente los parametros del softphone')
                new Resolver().error(res, "Error")
            }
        }
        catch(ex){
            new Resolver().exception(res,'Unexpected error.', ex);
        }
    }

    public async AppParameters(req:Request, res:Response):Promise <void>{
        try{
            console.log('Cambiando los parametros de los bot de la aplicacion')
            const appParameters = await getRepository(CatAppParameters)
            .createQueryBuilder()
            .update(CatAppParameters)
            .set({
                twilioAccountSID: req.body.twilioAccountSID,
                twilioAuthToken: req.body.twilioAuthToken,
                whatsappAccount: req.body.whatsappAccount,
                botTokenTelegram: req.body.botTokenTelegram
            })
            .where("id = :id", { id:1 })
            .execute();

            if(appParameters.affected ===1){
                console.log(`Parametros de los bots cambiados exitosamete`);
                new Resolver().success(res, 'Bots parameters correctly changed');
            }

        }
        catch(ex)
        {
            new Resolver().exception(res,'Unexpected error.', ex);   
        }
    }

    public async GetAppParameters(req:Request, res:Response){
        try{
            const appParameters = await getRepository(CatAppParameters)
            .find();

            let payload = {
                botParameters: appParameters
            }

            if(appParameters){
                new Resolver().success(res, 'Bots parameters correctly consulted', payload);
            }
            else{
                new Resolver().exception(res, 'Something went wrong with bot parameters info.');
            }
        }
        catch(ex)
        {
            new Resolver().exception(res,'Unexpected error.', ex);
        }
    }

    public async GetUsers(req:Request, res:Response){
        try{
            
            const user = await getRepository(CatUsers)
            .createQueryBuilder()
            .getMany();

            let payload = {
                users: user
            }

            if(user){
                new Resolver().success(res, 'Users correctly consulted', payload);
            }
            else{
                new Resolver().exception(res, 'Something went wrong with bot parameters info.');
            }
            
        }catch(ex){
            new Resolver().exception(res,'Unexpected error.', ex);
        }
    }

    public async GetUserCredentials(req:Request, res:Response){
        try{
            
            const user = await getRepository(CatUsers)
            .createQueryBuilder("user")
            .leftJoinAndSelect("user.credentials", "credentials")
            .where("user.ID = :id", {id: req.body.userId})
            .getOne();

            let payload = {
                user: user
            }

            if(user){
                new Resolver().success(res, 'Users correctly consulted', payload);
            }
            else{
                new Resolver().exception(res, 'Something went wrong with bot parameters info.');
            }
            
        }catch(ex){
            new Resolver().exception(res,'Unexpected error.', ex);
        }
    }

    // public async GetParametersFromDataBase():Promise<void>{
    //     try{
    //         const botToken = await getRepository(CatAppParameters)
    //         .createQueryBuilder("parameters")
    //         .select(["parameters.twilioAccountSID", "parameters.twilioAuthToken", "parameters.whatsappAccount", "parameters.botTokenTelegram"])
    //         .where("id = :id" ,{id:1})
    //         .getOne();
    //     }
    //     catch(ex){
    //         console.log(`Unexpected error ${ex}`)
    //     }
    // }
}


    // public async GetSoftphoneParameters(req:Request, res:Response):Promise <void>{
    //     try{
    //         //Se necesita vincular está tabla con la de usuario para poder
    //         //buscar por userName
    //         const getParameters = await getRepository(CatSoftphoneParameters)
    //         .createQueryBuilder("catsoftphoneparameters")
    //         .where("catsoftphoneparameters.userName = :name",{name: req.body.userName})
    //         .getOne();

    //         let payload = {
    //             softphoneParameters: getParameters
    //         }

    //         if(payload){
    //             new Resolver().success(res, 'Agent softphone parameters correctly consulted', payload);
    //         }
    //         else{
    //             new Resolver().error(res, 'Something bad with softphone agent info.');
    //         }
    //     }
    //     catch(ex){
    //         new Resolver().exception(res,'Unexpected error.', ex);
    //     }
    // }