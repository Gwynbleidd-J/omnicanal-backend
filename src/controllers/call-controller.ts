import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { Resolver } from "../services/resolver";
import { OpeCalls } from "../models/call";

export class CallController{

    public async RegistryIncomingCall(req:Request, res:Response): Promise<void>{
        try{
            const incomingCall = await getRepository(OpeCalls)
            .createQueryBuilder()
            .insert()
            .into(OpeCalls)
            .values({
                startTime: new Date().toLocaleTimeString('es-MX'),
                userId: req.body.userId,
                statusId: 1
            })
            .execute();
            // console.log(new Date().toLocaleDateString());
            // console.log(new Date().toLocaleString());
            // console.log(new Date().toLocaleTimeString('es-MX'));
            if(incomingCall){
                new Resolver().success(res, 'Date correctly stored')
            }else{
                new Resolver().exception(res, 'Date dont correctly stored')
            }
        }
        catch(ex){
            new Resolver().exception(res, 'Unexpected error', ex);
        }
    }

    public async CallTypification(req: Request, res:Response): Promise<void>{
        try{
            const callTypification = await getRepository(OpeCalls)
            .createQueryBuilder()
            .update(OpeCalls)
            .set({
                networkCategoryId: req.body.networkId,
                statusId: 3
            })
            .where('id = :id', {id: req.body.callId})
            .execute();

            if(callTypification.affected === 1){
                console.log('Network Category Asignado Correctamente');
                new Resolver().success(res, 'Network Category Correctly Inserted');
            }
            else{
                console.log('No se podo actualizar Network Category en OpeCalls');
                new Resolver().error(res, 'No se pudo actualizar Network Category');
            }
        }
        catch(ex){
            new Resolver().exception(res, 'Unexpected error', ex);
        }
    }
}