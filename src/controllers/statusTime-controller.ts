import { Request, Response } from "express";
import { getRepository, IsNull } from "typeorm";
import { OpeStatusTime } from "../models/statusTime";
import { Resolver } from "../services/resolver";

export class StatusTimeController{
    public async SetStatusTime(req:Request, res:Response):Promise<void>{
        try{
            const statusTime = await getRepository(OpeStatusTime)
            .createQueryBuilder()
            .insert()
            .into(OpeStatusTime)
            .values([
                {
                    startingTime: req.body.startingTime,
                    user: req.body.userId,
                    status: req.body.statusId
                }
            ])
            .execute();
            if(statusTime){
                new Resolver().success(res, 'Time status stored correctly', statusTime)
            }
            else{
                new Resolver().error(res, 'Time status did not  stored correctly')
            }
        }
        catch(error){
            console.log(`Error[StatusTime]: ${error}`);
        }
    } 

    public async ChangeStatus(req:Request, res:Response):Promise<void>{
        try{
            const findNull = await getRepository(OpeStatusTime).find({
                where:{
                    endingTime: IsNull(),
                    user: req.body.userId
                }, select:['id']
            })
            if(findNull){
                const setEnding= await getRepository(OpeStatusTime)
                .createQueryBuilder()
                .update(OpeStatusTime)
                .set({
                    endingTime: req.body.endingTime
                })
                .where("id = :id", {id: findNull[0].id})
                .execute();

                const update = await getRepository(OpeStatusTime)
                .createQueryBuilder()
                .insert()
                .into(OpeStatusTime)
                .values([{
                    startingTime: req.body.startingTime,
                    user: req.body.userId,
                    status: req.body.statusId
                }])
                .execute();
                
                if(findNull){
                    new Resolver().success(res, 'SetEnding stored Correcrly', findNull)
                }
                else{
                    new Resolver().error(res, 'SetEnding stored correctly')
                }
            }
        }catch(error){
            console.log(`Error[ChangeStatus]: ${error}`)
        }
    }

    public async UpdateAfterClose(req:Request, res:Response):Promise<void>{
        try{
           const update = await getRepository(OpeStatusTime)
            .createQueryBuilder()
            .update(OpeStatusTime)
            .set({
                endingTime: req.body.endingTime
            })
            .where("user = :user", {user: req.body.userId})
            .andWhere("status = :status", {status: req.body.statusId})
            .execute();


            if(update.affected === 1){
                new Resolver().success(res, 'Update stored correctly', update)
            }
            else{
                new Resolver().error(res, 'Update did not  stored correctly')
            }
        }catch(error){
            console.log(`Error[UpdateAfterClose]: ${error}`)
        }

    }

    public async TotalTime(req:Request, res:Response): Promise<void>{
        try{
            const findId = await getRepository(OpeStatusTime).find({
                where:{
                    status: req.body.statusId,
                    user: req.body.userId
                }, select:['id']
            })

            const total = await getRepository(OpeStatusTime)
            .createQueryBuilder("status")
            .where("status.id = :id" , {id: findId[0].id})
            .getMany();
            // const SUM = await getRepository(OpeStatusTime)
            // .createQueryBuilder("time")
            // .select("SUM(time.endingTime) - SUM(time.startingTime)", "time")
            // .where("time.id = :id", {id: findId[0].id})
            // .execute();

            if(total){
                new Resolver().success(res, 'Sum successfully', total);
            }
            else{
                new Resolver().error(res, 'Sum successfully');
            }

           


        }catch(error){

        }
    }
}