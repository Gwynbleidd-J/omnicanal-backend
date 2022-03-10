import { Console } from "console";
import { Request, Response } from "express";
import { getRepository, IsNull } from "typeorm";
import { OpeStatusTime } from "../models/statusTime";
import { Resolver } from "../services/resolver";

export class StatusTimeController {
    public async SetStatusTime(req: Request, res: Response): Promise<void> {
        try {
            const statusTime = await getRepository(OpeStatusTime)
                .createQueryBuilder()
                .insert()
                .into(OpeStatusTime)
                .values([
                    {
                        startingTime: req.body.startingTime,
                        userId: req.body.userId,
                        statusId: req.body.statusId
                    }
                ])
                .execute();
            if (statusTime) {
                new Resolver().success(res, 'Time status stored correctly', statusTime)
            }
            else {
                new Resolver().error(res, 'Time status did not  stored correctly')
            }
        }
        catch (error) {
            console.log(`Error[StatusTime]: ${error}`);
        }
    }

    public async ChangeStatus(req: Request, res: Response): Promise<void> {
        try {
            const findNull = await getRepository(OpeStatusTime).find({
                where: {
                    endingTime: IsNull(),
                    userId: req.body.userId
                }, select: ['id']
            })
            if (findNull) {
                const setEnding = await getRepository(OpeStatusTime)
                .createQueryBuilder()
                .update(OpeStatusTime)
                .set({
                    endingTime: req.body.endingTime
                })
                .where("id = :id", { id: findNull[0].id })
                .execute();
            }
            const update = await getRepository(OpeStatusTime)
            .createQueryBuilder()
            .insert()
            .into(OpeStatusTime)
            .values([{
                startingTime: req.body.startingTime,
                userId: req.body.userId,
                statusId: req.body.statusId
            }])
            .execute();
            
            if (findNull) {
                new Resolver().success(res, 'SetEnding stored Correcrly', findNull)
            }
            else {
                new Resolver().error(res, 'SetEnding stored correctly')
            }
        } catch (error) {
            console.log(`Error[ChangeStatus]: ${error}`)
        }
    }

    public async UpdateAfterClose(req: Request, res: Response): Promise<void> {
        try {

            const findNull = await getRepository(OpeStatusTime).find({
                where: {
                    endingTime: IsNull(),
                    userId: req.body.userId,
                    statusId: req.body.statusId
                }, select: ['id']
            })
            //Necesito cambiar a cual id referenciar ya que se cambiarian a todos los registros que tengan
            //los mismos parametres del .where() y .andWhere()
            const update = await getRepository(OpeStatusTime)
            .createQueryBuilder()
            .update(OpeStatusTime)
            .set({
                endingTime: req.body.endingTime
            })
            .where("id = :id", { id: findNull[0].id })
            // .where("userId = :user", { user: req.body.userId })
            // .andWhere("statusId = :status", { status: req.body.statusId })
            .execute();
            
            if (update.affected === 1) {
                new Resolver().success(res, 'Update stored correctly', update)
            }
            else {
                new Resolver().error(res, 'Update did not  stored correctly')
            }
        }catch(error){
            console.log(`Error[UpdateAfterClose]: ${error}`)
        }
    }

    // public async TotalTime(req: Request, res: Response): Promise<void> {
    //     try {
    //         const findId = await getRepository(OpeStatusTime).find({
    //             where: {
    //                 statusId: req.body.statusId,
    //                 userId: req.body.userId
    //             }, select: ['id']
    //         })

    //         const total = await getRepository(OpeStatusTime)
    //             .createQueryBuilder("status")
    //             .where("status.id = :id", { id: findId[0].id })
    //             .getMany();
    //         // const SUM = await getRepository(OpeStatusTime)
    //         // .createQueryBuilder("time")
    //         // .select("SUM(time.endingTime) - SUM(time.startingTime)", "time")
    //         // .where("time.id = :id", {id: findId[0].id})
    //         // .execute();

    //         if (total) {
    //             console.log("Se asigno correctamente el tiempo total");
    //             new Resolver().success(res, "Total time set successfully");

    //         }
    //         else {
    //             new Resolver().error(res, 'Sum successfully');
    //         }




    //     } catch (error) {

    //     }
    // }

    public async GetUserStates(req: Request, res: Response): Promise<void> {
        try {
            console.log('se entró en GetUserStates')
            let id = req.body.id;

            let date = new Date();

            var Month = (date.getMonth() + 1);
            var MonthS = Month.toString();
            if (Month < 10) {
                MonthS = "0"+MonthS
            }

            var day = (date.getDate());
            var dayS = day.toString();
            if (day < 10) {
                dayS = "0"+dayS
            }

            let today = date.getFullYear() + "-" + MonthS + "-" + dayS
            // console.log("La fecha actual es:" + today)

            const states = await getRepository(OpeStatusTime)
                .createQueryBuilder("states")
                .where("states.user =:id", { id: id})
                .andWhere("states.date =:today", { today:today})
                .getMany();

            let Disponible = 0;
            let NoDisponible = 0;
            let ACW = 0;
            let Capacitacion = 0;
            let Calidad = 0;
            let Sanitario = 0;
            let Comida = 0;
            let Break = 0;

            let Diferencias = [];

            states.forEach(element => {

                let tempStartDate = element.date;

                if (element.endingTime != null) {

                    let startStringDate = tempStartDate.toString();
                    let startStringTime = element.startingTime.toString();

                    let tempEndTime = element.endingTime;
                    let EndStringTime = tempEndTime.toString();

                    let DateStart = new Date(Number.parseInt(startStringDate.split('-')[0]), Number.parseInt(startStringDate.split('-')[1]), Number.parseInt(startStringDate.split('-')[2]),
                        Number.parseInt(startStringTime.split(':')[0]), Number.parseInt(startStringTime.split(':')[1]), Number.parseInt(startStringTime.split(':')[2]));

                    let DateEnd = new Date(Number.parseInt(startStringDate.split('-')[0]), Number.parseInt(startStringDate.split('-')[1]), Number.parseInt(startStringDate.split('-')[2]),
                        Number.parseInt(EndStringTime.split(':')[0]), Number.parseInt(EndStringTime.split(':')[1]), Number.parseInt(EndStringTime.split(':')[2]));

                    let starMiliseconds = DateStart.getTime();
                    let endMilliseconds = DateEnd.getTime();

                    let diff = Math.abs(endMilliseconds - starMiliseconds);
                    let difference = Math.floor((diff / 1000) / 60);

                    let statusElement = Number.parseInt(element.statusId.toString());
                    switch (statusElement) {
                        case 7:
                            Disponible += difference
                            break;
                        case 8:
                            NoDisponible += difference
                            break;
                        case 9:
                            ACW += difference
                            break;
                        case 10:
                            Capacitacion += difference
                            break;
                        case 1:
                            Calidad += difference
                            break;
                        case 2:
                            Sanitario += difference
                            break;
                        case 3:
                            Comida += difference
                            break;
                        case 4:
                            Break += difference
                            break;

                    }

                    // console.log("La diferencia entre: " + DateEnd + " y \n" + DateStart + "\nEs:" + difference);
                    Diferencias.push("Minutos:" + difference+"\nEstatus:"+element.statusId);
                }


            });

            // console.log("Diferencias encontradas" + JSON.stringify(Diferencias));
            console.log(
                   "Disponible:" +Disponible+ 
                   	"\nNo Disponible:" +NoDisponible+
                   	"\nACW:" +ACW+
                   	"\nCapacitacion:" +Capacitacion+
                    "\nCalidad:" +Calidad+
                    "\nSanitario:" +Sanitario+
                    "\nComida:" +Comida+
                    "\nBreak:"+Break
            )

            let object={
                Disponible,
                NoDisponible,
                ACW,
                Capacitacion,Calidad,
                Sanitario,
                Comida,
                Break
            }

            // console.log("Registros conseguidos:" + JSON.stringify(states));

            if (states) {
                new Resolver().success(res, 'Estados consultados correctamente', object);
            }
            else {
                new Resolver().exception(res, 'Algo salio mal con la informacion de los estados.');
            }

        } catch (error) {
            console.log("[Error]GetUserStates:" + error);
        }
    }



    public async GetUserStatesSupervisor(req: Request, res: Response): Promise<void> {
        try {
            console.log('se entró en GetUserStates')
            let id = req.body.id;

            let date = new Date();

            var Month = (date.getMonth() + 1);
            var MonthS = Month.toString();
            if (Month < 10) {
                MonthS = "0"+MonthS
            }

            var day = (date.getDate());
            var dayS = day.toString();
            if (day < 10) {
                dayS = "0"+dayS
            }

            let today = date.getFullYear() + "-" + MonthS + "-" + dayS
            // console.log("La fecha actual es:" + today)

            const states = await getRepository(OpeStatusTime)
                .createQueryBuilder("states")
                .where("states.user =:id", { id: id})
                .andWhere("states.date =:today", { today:today})
                .getMany();

            let Disponible = 0;
            let NoDisponible = 0;
            let ACW = 0;
            let Capacitacion = 0;
            let Calidad = 0;
            let Sanitario = 0;
            let Comida = 0;
            let Break = 0;

            let Diferencias = [];

            states.forEach(element => {

                let tempStartDate = element.date;

                if (element.endingTime != null) {

                    let startStringDate = tempStartDate.toString();
                    let startStringTime = element.startingTime.toString();

                    let tempEndTime = element.endingTime;
                    let EndStringTime = tempEndTime.toString();

                    let DateStart = new Date(Number.parseInt(startStringDate.split('-')[0]), Number.parseInt(startStringDate.split('-')[1]), Number.parseInt(startStringDate.split('-')[2]),
                        Number.parseInt(startStringTime.split(':')[0]), Number.parseInt(startStringTime.split(':')[1]), Number.parseInt(startStringTime.split(':')[2]));

                    let DateEnd = new Date(Number.parseInt(startStringDate.split('-')[0]), Number.parseInt(startStringDate.split('-')[1]), Number.parseInt(startStringDate.split('-')[2]),
                        Number.parseInt(EndStringTime.split(':')[0]), Number.parseInt(EndStringTime.split(':')[1]), Number.parseInt(EndStringTime.split(':')[2]));

                    let starMiliseconds = DateStart.getTime();
                    let endMilliseconds = DateEnd.getTime();

                    let diff = Math.abs(endMilliseconds - starMiliseconds);
                    let difference = (diff / 1000);

                    let statusElement = Number.parseInt(element.statusId.toString());
                    switch (statusElement) {
                        case 7:
                            Disponible += difference
                            break;
                        case 8:
                            NoDisponible += difference
                            break;
                        case 9:
                            ACW += difference
                            break;
                        case 10:
                            Capacitacion += difference
                            break;
                        case 1:
                            Calidad += difference
                            break;
                        case 2:
                            Sanitario += difference
                            break;
                        case 3:
                            Comida += difference
                            break;
                        case 4:
                            Break += difference
                            break;

                    }

                    // console.log("La diferencia entre: " + DateEnd + " y \n" + DateStart + "\nEs:" + difference);
                    Diferencias.push("Minutos:" + difference+"\nEstatus:"+element.statusId);
                }


            });

            // console.log("Diferencias encontradas" + JSON.stringify(Diferencias));
            console.log(
                   "Disponible:" +Disponible+ 
                   	"\nNo Disponible:" +NoDisponible+
                   	"\nACW:" +ACW+
                   	"\nCapacitacion:" +Capacitacion+
                    "\nCalidad:" +Calidad+
                    "\nSanitario:" +Sanitario+
                    "\nComida:" +Comida+
                    "\nBreak:"+Break
            )

            let object={
                Disponible,
                NoDisponible,
                ACW,
                Capacitacion,Calidad,
                Sanitario,
                Comida,
                Break
            }

            // console.log("Registros conseguidos:" + JSON.stringify(states));

            if (states) {
                new Resolver().success(res, 'Estados consultados correctamente', object);
            }
            else {
                new Resolver().exception(res, 'Algo salio mal con la informacion de los estados.');
            }

        } catch (error) {
            console.log("[Error]GetUserStates:" + error);
        }
    }


}