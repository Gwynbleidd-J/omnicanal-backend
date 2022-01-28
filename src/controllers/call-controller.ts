import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { Resolver } from "../services/resolver";
import { OpeCalls } from "../models/call";
import { CatUsers } from '../models/user';


export class CallController {
    public async RegistryIncomingCall(req: Request, res: Response): Promise<void> {
        try {
            
            const incomingCall = await getRepository(OpeCalls)
            .createQueryBuilder()
            .insert()
            .into(OpeCalls)
            .values({
                startTime: req.body.startTime,
                userId: req.body.userId,
                statusId: 2,
                tipoLlamada: req.body.tipoLlamada,
                llamadaTransferida: req.body.llamadaTransferida,
            })      
            .execute();

            const callId = await getRepository(OpeCalls).find({
                where: {
                    startTime: req.body.startTime,
                },
                select: ["id"],
            });

            const callDate = await getRepository(OpeCalls).find({
                where: {
                    startTime: req.body.startTime,
                },
                select: ["date"],
            });
            const siglasUser = await getRepository(CatUsers).find({
                where: {
                    ID: req.body.userId
                },
                select: ["siglasUser"],
            });
            let fecha = callDate[0].date.toLocaleString().toString().replace(/-/g, '')
            //console.log(fecha);
            // console.log(new Date().toLocaleDateString());
            // console.log(new Date().toLocaleString());
            // console.log(new Date().toLocaleTimeString('es-MX'));
            
            if (incomingCall) {
                let folio = `${siglasUser[0].siglasUser}_${fecha}_${callId[0].id}`
                console.log(folio);
                const folioLlamada = await getRepository(OpeCalls)
                .createQueryBuilder()
                .update(OpeCalls)
                .set({
                    folioLlamada: folio 
                })
                .where("id = :id", { id: callId[0].id })
                .execute()
                new Resolver().success(res, "Call correctly stored",folio);
            }else{
                new Resolver().exception(res, "Call dont stored");
            }
        }catch (ex) {
            new Resolver().exception(res, "Unexpected error", ex);
        }
    }

    public async CallTypification(req: Request, res: Response): Promise<void> {
        try {
            const call = await getRepository(OpeCalls).find({
                where: {
                    startTime: req.body.startTime,
                },
                select: ["id"],
            }); //Terminación del metodo .find {select: ["id"]};


            const callTypification = await getRepository(OpeCalls)
            .createQueryBuilder()
            .update(OpeCalls)
            .set({
                endingTime: req.body.endingTime,
                networkCategoryId: req.body.networkCategoryId,
                statusId: 3,
                comments: req.body.comments,
                score: req.body.score,
            })
            .where("id = :id", { id: call[0].id })
            .execute();
            // .createQueryBuilder()
            // .update(OpeCalls)
            // .set({a
            //     endingTime: req.body.endingTime,
            //     networkCategoryId: req.body.networkId,
            //     statusId: 3,
            //     comments: req.body.comments,
            //     score: req.body.score
            // })
            // .where('userId = :userId', { userId: req.body.userId})
            // .execute();
            
            if (callTypification) {
                console.log("Network Call Category Asignado Correctamente");
                new Resolver().success(res, "Network Category Correctly Inserted");
            } else {
                console.log("No se podo actualizar Network Call Category en OpeCalls");
                new Resolver().error(res, "No se pudo actualizar Network Category");
            }
        } catch (ex) {
            new Resolver().exception(res, "Unexpected error", ex);
        }
    }
    
    public async getIdCall(req: Request, res: Response): Promise<void> {
        try {
            const call = await getRepository(OpeCalls).find({
                where: {
                    startTime: req.body.startTime,
                },
                select: ["id"],
            });
            
            let temp = call[0].id;
            console.log(temp);
            
            new Resolver().success(res, "El id de la llamada es:", temp);
        } catch (ex) {
            new Resolver().exception(res, "Unexpected error", ex);
        }
    }
    public async getTotalCalls(req: Request, res: Response) {
        try {
            var userId = req.body.userId;
            const calls = await getRepository(OpeCalls)
            .createQueryBuilder("calls")
            .where("calls.userId = :userId", { userId: userId })
            .getMany();
            
            var today = new Date();
            var date = today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();
            var llamadas = [];
            
            calls.forEach((element) => {
                let startDate = element.date;
                var object = {
                    id: element.id,
                    tipoLlamada: element.tipoLlamada,
                    statusId: element.statusId
                }

                if (startDate.toString() == date) {
                    llamadas.push(object);
                }
                // llamadas.push(object);   

            });            

            console.log("\nSe obtuvieron "+llamadas.length + " llamadas");
            new Resolver().success(res, "Se obtuvieron las llamadas correctamente", llamadas)

        } catch (error) {
            console.log("Error[getTotalCalls]:" +error);
        }
    }
}
