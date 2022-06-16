import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { Resolver } from '../services/resolver';
import { Utils } from "../services/utils";
import { CatAuxiliarStatuses } from '../models/auxiliarStatus';
import { CatUsers } from '../models/user';
import { MessengerController } from "./messenger-controller";

export class StatusUserController{
    public async getUserStatus(req:Request, res: Response): Promise<void>{
        //console.log('Consultado los status disponibles de los agentes');
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

                let status = await new StatusUserController().getAgentStatus(req.body.status);
                new MessengerController().NotificateLeader("CS", req.body.id, null, status);

                if( req.body.status == 7){
                    new MessengerController().ReAsignQueuedChat();
                }

                console.log('User Status Asignado Correctamente');
                new Resolver().success(res, 'User Status correctly inserted');
            }
        }
        catch(ex){
            new Resolver().exception(res, 'Unexpected error', ex);
        }
    }

    public async getAgentStatus(statusId: any) {
        try {
            console.log("\nObteniendo status del agente...");
            const status = await getRepository(CatAuxiliarStatuses)
                .createQueryBuilder("status")
                .where("status.id = :id", {  id: statusId })
                .getOne();

            console.log("Status del agente:" + status.status );
            return status.status;
        } catch (error) {
            console.log("Error[getAgentStatus]status-controller:" + error);
        }
    }

    public async UpdateColmnActiveOnClose(req:Request, res:Response):Promise<void>{
        try{
            let user = await getRepository(CatUsers)
            .createQueryBuilder()
            .update(CatUsers)
            .set({ activo:0 })
            .where("ID = :userId", {userId: req.body.userId})
            .execute()

            if(user.affected === 1){
                console.log('La columna activo se modifico correctamente a valor 0')
                new Resolver().success(res, 'activo column has change correctly');
            }
        }catch(ex){
            console.log('Error:[UpdateColmnActiveOnClose]', ex);
            new Resolver().error(res, 'Error:[UpdateColmnActiveOnClose]')
        }
    }

}