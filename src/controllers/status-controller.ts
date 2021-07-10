import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { Resolver } from '../services/resolver';
import { Utils } from "../services/utils";
import { CatAuxiliarStatuses } from '../models/auxiliarStatus';
import { CatUsers } from '../models/user';

export class StatusUserController{
    public async getUserStatus(req:Request, res: Response): Promise<void>{
        console.log('Consultado los status disponibles de los agentes');
        try{
           const userStatus = await getRepository(CatAuxiliarStatuses).find();

            if(userStatus){
                let status= userStatus;
                new Resolver().success(res, 'User status correctly consulted', {status});
            }
            else{
                new Resolver().error(res, 'Something bad with user status info.');
            }
        }
        catch(ex){
            console.log(`Error[getUSerStatus] ${ex}`);
        }
    }

    public async updateUserStatus(req:Request, res:Response): Promise<void>{
        try{
            console.log(`Consultado el estatus del agente: ${req.body.id}`);
            console.log(`El Id del estado seleccionado por el agente es: ${req.body.status}`);
            const updateUserStatus = await getRepository(CatUsers)
            .createQueryBuilder()
            .update(CatUsers)
            .set({statusID: req.body.status})
            .where("ID = :id", {id: req.body.id})
            .execute();
            

            if(updateUserStatus.affected === 1){
                console.log('User Status Asignado Correctamente');
                new Resolver().success(res, 'User Status correctly inserted');
            }
            else{
                console.log('No se pudo actualizar StatusId en Cat_Users');
            }
        }
        catch(ex){
            new Resolver().exception(res, 'Unexpected error', ex);
        }
    }
}