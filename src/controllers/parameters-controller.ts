import { Request, Response } from "express";  
import { getRepository } from "typeorm";
import { CatSoftphoneParameters } from '../models/softphoneParameters';
import { Resolver } from '../services/resolver';
import { CatAppParameters } from '../models/appParameters';
import { CatUsers } from '../models/user';

export class ParametersController{
    public async GetUsers(req:Request, res:Response):Promise <void>{
        try{
            
            const user = await getRepository(CatUsers)
            .createQueryBuilder("users")
            .getMany();

            let payload = {
                users: user
            }

            if(user){
                new Resolver().success(res, 'Users correctly consulted', payload);
            }
            
        }catch(ex){
            new Resolver().exception(res,'Unexpected error.', ex);
        }
    }

    public async UpdateSoftphoneParameters(req:Request, res:Response ): Promise <void>{
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
        }
        catch(ex){
            new Resolver().exception(res,'Unexpected error.', ex);
        }
    }

    public async GetSoftphoneUserCredentials(req:Request, res:Response): Promise <void>{
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
        }catch(ex){
            new Resolver().exception(res,'Unexpected error.', ex);
        }
    }

    public async GetUserData(req:Request, res:Response): Promise <void>{
        try{
            console.log(`consultado lo datos del agente con id:${req.body.userId}`)
            const user = await getRepository(CatUsers)
            .createQueryBuilder("user")
            .where("user.ID = :id", {id: req.body.userId})
            .getOne();
            
            let payload = {
                user:user
            }
            
            if(user){
                new Resolver().success(res, 'User correctly consulted', payload);
            }
        }
        catch(ex){
            new Resolver().error(res, 'Unexpected error', ex);
        }
    }

    public async SaveNewUser(req:Request, res:Response): Promise <void>{
        try{
            let nombre = req.body.nombre;
            let apPaterno = req.body.apPaterno;
            let apMaterno = req.body.apMaterno;
            let email = req.body.email;
            let contrasena = req.body.contrasena;
            let siglasUsuario = req.body.siglasUsuario;
            let tipoUsuario = req.body.tipoUsuario;

            console.log(`nombre: ${nombre}`);
            console.log(`Apellido P: ${apPaterno}`);
            console.log(`Apellido M: ${apMaterno}`);
            console.log(`email: ${email}`);
            console.log(`contraseña: ${contrasena}`);
            console.log(`siglas: ${siglasUsuario}`);
            console.log(`tipo Usuario: ${tipoUsuario}`);

            // let object = {
            //     nombre,
            //     apPaterno,
            //     apMaterno,
            //     email,
            //     contrasena,
            //     siglasUsuario,
            //     tipoUsuario
            // }
            const user = await getRepository(CatUsers)
            .createQueryBuilder()
            .insert()
            .into(CatUsers)
            .values({
                name: nombre,
                paternalSurname: apPaterno,
                maternalSurname: apMaterno,
                email: email,
                password: contrasena,
                activeChats: 0,
                rolID: Number.parseInt(tipoUsuario),
                statusID: 8,
                leaderId: 13,
                maxActiveChats: 5,
                siglasUser: siglasUsuario,
                activo: 0
            })
            .execute()

            new Resolver().success(res, 'User Information',user);
        }
        catch(ex){
            new Resolver().error(res, 'Unexpected error',ex);
        }
    }

    public async UpdateUser(req:Request, res:Response): Promise <void>{
        try{
            console.log(`cambiando la información del usuario con id: ${req.body.userId}`);
            let nombre = req.body.nombre;
            let apPaterno = req.body.apPaterno;
            let apMaterno = req.body.apMaterno;
            let email = req.body.email;
            let contrasena = req.body.contrasena;
            let siglasUsuario = req.body.siglasUsuario;
            let tipoUsuario = req.body.tipoUsuario;
            const user = await getRepository(CatUsers)
            .createQueryBuilder()
            .update(CatUsers)
            .set({
                name: nombre,
                paternalSurname: apPaterno,
                maternalSurname: apMaterno,
                email: email,
                password: contrasena,
                rolID: Number.parseInt(tipoUsuario),
                siglasUser: siglasUsuario,
            })
            .where("ID = :userId", {userId: req.body.userId})
            .execute();

            if(user.affected === 1){
                console.log(`Parametros del usuario cambiados exitosamente`);
                new Resolver().success(res, 'User parameters correctly changed');
            }
        }
        catch(ex){
            new Resolver().exception(res,'Unexpected error.', ex);
        }
    }

    public async DeleteUser(req: Request, res:Response): Promise <void>{
        try{
            console.log(`borrando registro del usuario con el id:${req.body.userId}`);
            const user = await getRepository(CatUsers)
            .createQueryBuilder()
            .delete()
            .from(CatUsers)
            .where("ID = :userId", {userId: req.body.userId})
            .execute()

            if(user.affected === 1){
                console.log(`Usuario borrado exitosamente`);
                new Resolver().success(res, 'User correctly deleted');
            }
        }
        catch(ex){
            new Resolver().exception(res,'Unexpected error.', ex);
        }
    }
}