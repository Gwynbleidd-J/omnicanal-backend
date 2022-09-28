import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { Resolver } from "../services/resolver";
import { OpeCalls } from '../models/call';
import { CatUsers } from '../models/user';
import { Logger } from "../services/logger";


export class CallController {
    public async RegistryIncomingCall(req: Request, res: Response): Promise<void> {
        let logger: Logger = new Logger('call');
        try {
            console.log('entró RegistryIncomingCall');
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
                startingDate: req.body.startingDate,
                clientPhoneNumber: req.body.clientPhoneNumber,
                agentExtension: req.body.agentPhoneNumber
            })      
            .execute();
            let idLlamada = incomingCall.identifiers[0].id;
            // const tempCalls = await getRepository(OpeCalls)
            // .createQueryBuilder("calls")
            // .where("startTime = :startTime",{ startTime: req.body.startTime})
            // .getOne();

            // const callId = tempCalls.id;
            // const callDate = tempCalls.date;

            // const callId = await getRepository(OpeCalls).find({
            //     where: {
            //         id: idLlamada,
            //     },
            //     select: ["id"],
            // });

            const callDate = await getRepository(OpeCalls).find({
                where: {
                    id: idLlamada,
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
            console.log(fecha);
            //console.log(fecha);
            // console.log(new Date().toLocaleDateString());
            // console.log(new Date().toLocaleString());
            // console.log(new Date().toLocaleTimeString('es-MX'));
            
            let folio = `${siglasUser[0].siglasUser}_${fecha}_${idLlamada}`
            console.log(folio);
            const folioLlamada = await getRepository(OpeCalls)
            .createQueryBuilder()
            .update(OpeCalls)
            .set({
                folioLlamada: folio 
            })
            .where("id = :id", { id: idLlamada })
            .execute()

            
            let object = {
                idLlamada,
                folio
            }
            
            new Resolver().success(res, "Call correctly stored",object);
        }catch (ex) {
            new Resolver().exception(res, "Unexpected error", ex);
        }
    }

    public async CallTypification(req: Request, res: Response): Promise<void> {
        try {
            console.log('Entró a CallTypification');
            let idLlamada = req.body.idLlamada;
            console.log(idLlamada);
            const call = await getRepository(OpeCalls).find({
                where: {
                    startTime: req.body.startTime,
                },
                select: ["id"],
            }); //Terminación del metodo .find {select: ["id"]};
            
            if(!req.body.score){
                const callTypification = await getRepository(OpeCalls)
                .createQueryBuilder()
                .update(OpeCalls)
                .set({
                    endingTime: req.body.endingTime,
                    networkCategoryId: req.body.networkCategoryId,
                    statusId: 3,
                    comments: req.body.comments,
                    score: 0
                })
                .where("id = :id", { id: idLlamada })
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
                }
            }
            else{
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
                .where("id = :id", { id: idLlamada })
                .execute();
                if (callTypification) {
                    console.log("Network Call Category Asignado Correctamente");
                    new Resolver().success(res, "Network Category Correctly Inserted");
                }
            }
        } catch (ex) {
            new Resolver().exception(res, "Unexpected error", ex);
        }
    }
    
    public async UserHangUp(req:Request, res:Response):Promise<void>{
        try{
            let idLlamada = req.body.IdLlamada;
            console.log(`UserHangUp Id Llamada: ${idLlamada}`);
            const user = await getRepository(OpeCalls)
            .createQueryBuilder()
            .update(OpeCalls)
            .set({colgo: 0})
            .where("id = :id", {id:idLlamada})
            .execute();

            if(user.affected === 1){
                new Resolver().success(res, "User HangUp");
            }
            

        }
        catch(ex){
            new Resolver().exception(res, "Unexpected error", ex);
        }
    }

    public async VendorHangUp(req:Request, res:Response):Promise<void>{
        try{
            let idLlamada = req.body.IdLlamada;
            console.log(`VendorHangUp Id Llamada: ${idLlamada}`);
            let colgo = req.body.colgo
            const vendor = await getRepository(OpeCalls)
            .createQueryBuilder()
            .update(OpeCalls)
            .set({colgo: 1})
            .where("id = :id", {id:idLlamada})
            .execute();

            if(colgo.affected === 1){
                new Resolver().success(res, "Vendor HangUp");
            }

        }
        catch(ex){
            new Resolver().exception(res, "Unexpected error", ex);
        }
    }

    public async getIdCall(req: Request, res: Response): Promise<void> {
        try {
            let idLlamada = req.body.idLlamada
            console.log(idLlamada);
            
            new Resolver().success(res, "El id de la llamada es:", idLlamada);
        } catch (ex) {
            new Resolver().exception(res, "Unexpected error", ex);
        }
    }
    
    public async getTotalCalls(req: Request, res: Response) {
        try {
            var today = new Date();
            var Month = (today.getMonth() + 1);
            var MonthS = Month.toString();
            if (Month < 10) {
                MonthS = "0"+MonthS
            }

            var day = (today.getDate());
            var dayS = day.toString();
            if (day < 10) {
                dayS = "0"+dayS
            }

            var date = today.getFullYear() + "-" + MonthS + "-" + dayS
            //var date = today.getFullYear() + "-" + MonthS + "-" + "01"


            var userId = req.body.userId;
            const calls = await getRepository(OpeCalls)
            .createQueryBuilder("calls")
            .where("calls.userId = :userId", { userId: userId })
            .andWhere("calls.date = :today", { today: date})
            .getMany();
            
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

            });            

            console.log("\nSe obtuvieron "+llamadas.length + " llamadas");
            new Resolver().success(res, "Se obtuvieron las llamadas correctamente", llamadas)

        } catch (error) {
            console.log("Error[getTotalCalls]:" +error);
        }
    }
    
    public async GetCalls(req:Request, res:Response):Promise<void>{
        try{
            let userId = req.body.userId;
            let fechaInicial = req.body.fechaInicial;   
            let fechaFinal = req.body.fechaFinal;

            // console.log(`date: ${date}`);
            console.log(`userId: ${userId}`);
            console.log(`fechaInicial: ${fechaInicial}`);
            console.log(`fechaFinal: ${fechaFinal}`);
            
            if(userId === ""){
                console.log('Se va a consultar las llamadas en general');
                const calls = await getRepository(CatUsers)
                .createQueryBuilder("user")
                .innerJoinAndSelect("user.call", "call")
                .select(["user.name", "user.paternalSurname", "user.maternalSurname", "call.date", "call.startTime", "call.endingTime", "call.folioLlamada", "call.comments", "call.colgo", "call.clientPhoneNumber", "call.agentExtension", "call.tipoLlamada"])
                .where(`call.date BETWEEN '${fechaInicial}' AND '${fechaFinal}'`)
                .getMany()

                let object = {
                    users:calls
                }

                console.log("Llamadas por agente", object);
                new Resolver().success(res, "Data", object);
            }
            else{
                if(userId !== "" && fechaInicial !== ""  && fechaFinal === ""){
                    console.log(`Consultado todas las llamdas del agente:${userId} en el día:${fechaInicial}`)
                    const calls = await getRepository(CatUsers)
                    .createQueryBuilder("user")
                    .innerJoinAndSelect("user.call", "call")
                    .select(["user.name", "user.paternalSurname", "user.maternalSurname", "call.date", "call.startTime", "call.endingTime", "call.folioLlamada", "call.comments", "call.colgo", "call.clientPhoneNumber", "call.agentExtension", "call.tipoLlamada"])
                    .where("call.date = :date", {date: fechaInicial})
                    .andWhere("call.userId = :userId", {userId: userId})
                    .getMany()

                    let object = {
                        users:calls
                    }

                    console.log("Llamadas por agente", object);
                    new Resolver().success(res, "Data", object);
                }
                else {
                    console.log(`Consultado todas las llamdas del usuario: ${userId} entre:${fechaInicial} y ${fechaFinal}`);
                    const calls = await getRepository(CatUsers)
                    .createQueryBuilder("user")
                    .innerJoinAndSelect("user.call", "call")
                    .select(["user.name", "user.paternalSurname", "user.maternalSurname", "call.date", "call.startTime", "call.endingTime", "call.folioLlamada", "call.comments", "call.colgo", "call.clientPhoneNumber", "call.agentExtension", "call.tipoLlamada"])
                    .where(`call.date BETWEEN '${fechaInicial}' AND '${fechaFinal}'`)
                    .getMany()

                    let object = {
                        users:calls
                    }

                    console.log("Llamadas por agente", object);
                    new Resolver().success(res, "Data", object);
                }
            }
        }
        catch(ex){
            new Resolver().error(res, "Error", ex);
            console.log("Error[GetCalls]", ex);
        }
    }
}
