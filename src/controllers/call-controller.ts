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
                startTime: req.body.startTime,
                userId: req.body.userId,
                statusId: 2
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

            const call = await getRepository(OpeCalls).find({where:{
                startTime: req.body.startTime
            },
                select:["id"]}
            )//Terminación del metodo .find {select: ["id"]};
            const callTypification = await getRepository(OpeCalls)
            .createQueryBuilder()
            .update(OpeCalls)
            .set({
                endingTime: req.body.endingTime,
                networkCategoryId: req.body.networkCategoryId,
                statusId: 3,
                comments: req.body.comments,
                score: req.body.score
            })
            .where("id = :id", {id: call[0].id})
            .execute()


            // .createQueryBuilder()
            // .update(OpeCalls)
            // .set({
            //     endingTime: req.body.endingTime,
            //     networkCategoryId: req.body.networkId,
            //     statusId: 3,
            //     comments: req.body.comments,
            //     score: req.body.score
            // })
            // .where('userId = :userId', { userId: req.body.userId})
            // .execute();

            if(callTypification){
                console.log('Network Call Category Asignado Correctamente');
                new Resolver().success(res, 'Network Category Correctly Inserted');
            }
            else{
                console.log('No se podo actualizar Network Call Category en OpeCalls');
                new Resolver().error(res, 'No se pudo actualizar Network Category');
            }
        }
        catch(ex){
            new Resolver().exception(res, 'Unexpected error', ex);
        }
    }
}