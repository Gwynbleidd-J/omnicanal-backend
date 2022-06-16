import { Request, Response } from "express";
import { getRepository, QueryBuilder, IsNull, createQueryBuilder } from 'typeorm';
import { OpeStatusTime } from '../models/statusTime';
import { Resolver } from "../services/resolver";
import { Logger } from "../services/logger";
import moment from "moment";

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
                        statusId: req.body.statusId,
                        startingDate: req.body.startDate
                    }
                ])
                .execute();
                let idStatus = statusTime.identifiers[0].id
                console.log('id del status actual: ', idStatus);
                let object = {
                    statusId: idStatus
                }
                new Resolver().success(res, 'Time status stored correctly', object)
        }
        catch (error) {
            console.log(`Error[StatusTime]: ${error}`);
        }
    }

    public async ChangeStatus(req: Request, res: Response): Promise<void> {
        try {
            let idStatus = req.body.idStatus;
            console.log('entró en ChangeStatus');
            console.log("Id de status al cambiar:", idStatus)

            // const findNull = await getRepository(OpeStatusTime).find({
            //     where: {
            //         endingTime: IsNull(),
            //         userId: req.body.userId,
            //         id: idStatus
            //     }, select: ['id']
            // })
            // if (findNull) {
                await getRepository(OpeStatusTime)
                .createQueryBuilder()
                .update(OpeStatusTime)
                .set({
                    endingTime: req.body.endingTime
                })
                .where("id = :id", { id: idStatus })
                .execute();
            // }
            const update = await getRepository(OpeStatusTime)
            .createQueryBuilder()
            .insert()
            .into(OpeStatusTime)
            .values([{
                startingTime: req.body.startingTime,
                userId: req.body.userId,
                statusId: req.body.statusId,
                startingDate: req.body.startDate
            }])
            .execute();
            let idLlamada = update.identifiers[0].id
            console.log('Id Status Nuevo:', idLlamada);
            let object = {
                idStatus: idLlamada
            }
            
            // if (findNull) {
                console.log('Se cambio correctamente al estado', req.body.statusId)
                new Resolver().success(res, 'SetEnding stored Correcrly', object)
            // }
        } catch (error) {
            console.log(`Error[ChangeStatus]: ${error}`)
        }
    }

    public async UpdateAfterClose(req: Request, res: Response): Promise<void> {
        let logger:Logger = new Logger('status')
        try {
            let statusId = req.body.idStatus;
            logger.info('[UpdateAfterClose user id]: ' + JSON.stringify(req.body.userId));
            logger.info('[UpdateAfterClose status id]: ' + JSON.stringify(req.body.statusId));
            console.log('Id Usuario que cierra sesión:', req.body.userId);
            console.log('Id Status que cierra sesión:', req.body.statusId);
            console.log()
            // const findNull = await getRepository(OpeStatusTime).find({
            //     where: {
            //         endingTime: IsNull(),
            //         userId: req.body.userId,
            //         statusId: req.body.statusId
            //     }, select: ['id']
            // })
            console.log('Id OpeStatusTime: ', statusId);
            logger.info('Id del cual se va a cerrar el estatus del agente' + JSON.stringify(statusId));
            //Necesito cambiar a cual id referenciar ya que se cambiarian a todos los registros que tengan
            //los mismos parametres del .where() y .andWhere()
            const update = await getRepository(OpeStatusTime)
            .createQueryBuilder()
            .update(OpeStatusTime)
            .set({
                endingTime: req.body.endingTime
            })
            .where("id = :id", { id: statusId })
            // .where("userId = :user", { user: req.body.userId })
            // .andWhere("statusId = :status", { status: req.body.statusId })
            .execute().then(result =>{
                logger.info('Update guardardo correctamente:' + JSON.stringify(result.affected));
                new Resolver().success(res, 'Update stored correctly', result.affected);
                console.log('Update Status stored correctly', result.affected);
            }).catch(ex =>{
                logger.info('Error[UpdateAfterClose]:' + JSON.stringify(ex));
                new Resolver().success(res, 'Update stored correctly:', ex);
                console.log('Update Status stored correctly:', ex);
            });
            // if (update.affected === 1) {
            //     new Resolver().success(res, 'Update stored correctly', update)
            // }
            // else {
            //     new Resolver().error(res, 'Update did not  stored correctly')
            // }
        }catch(error){
            logger.error('Error[updateAfterClose]'+ JSON.stringify(error));
            new Resolver().error(error, 'Error[UpdateAfterClose]');
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

    public async GetTimeCurrentStatus(req: Request, res:Response): Promise <void>{
        try{
            //?CHECAR EL EL METODO GETUSERSTATES YA QUE ES EL MISMO QUE JACOBO USA PARA LOS ESTADOS QUE TIENE EL USUARIO
        //? arrelgo userId diferecia, status  
        //?
        //*datos que se reciben desde la aplicación
        let now = moment();

        const startDate = await createQueryBuilder(OpeStatusTime, "status")
        .innerJoinAndSelect("status.user", "c")
        .innerJoinAndSelect("status.status", "o")
        .leftJoinAndSelect("c.call", "calls")
        .where("c.activo = :activo", {activo:1} )
        .andWhere("status.endingTime IS NULL")
        .andWhere("c.rolID = :rolId", {rolId: 1})
        .orderBy("status.id", "DESC")
        .getMany();


        //*Para verificar que los datos vengan correctos desde base de datos
        // console.log(startDate);
        // new Resolver().success(res, 'datos', startDate);

        let userId = 0;
        let nombre:String = "";
        let minutos;
        let status = 0;
        let nombreEstatus:String = "";
        let Disponible = 0;
        let NoDisponible = 0;
        let ACW = 0;
        let Capacitacion = 0;
        let Calidad = 0;
        let Sanitario = 0;
        let Comida = 0;
        let Break = 0;
        let Llamada = 0;
        let Usuarios = [];

        startDate.forEach(element =>{
            let tempStatingTime = element.startingDate
            
            if(element.endingTime == null){
                let fecha = moment(tempStatingTime);
                // console.log(`Fecha en base de datos: ${fecha}`);
                // console.log(`Fecha en la maquina: ${now}`);        
                console.log(`Id Usuario: ${element.userId}`);
                console.log(`Id Status: ${element.statusId}`);


                minutos = now.diff(fecha, "m")
                console.log(minutos);
                let statusElement = Number.parseInt(element.statusId.toString())
                switch(statusElement){
                    case 7:
                        Disponible += minutos;
                        userId = element.userId;
                        nombre = element.user.name;
                        status = element.statusId;
                        nombreEstatus = element.status.status;
                        break;
                    case 8:
                        NoDisponible += minutos;
                        userId = element.userId;
                        nombre = element.user.name;
                        status = element.statusId;
                        nombreEstatus = element.status.status;
                        break;
                    case 9:
                        ACW += minutos;
                        userId = element.userId;
                        nombre = element.user.name;
                        status = element.statusId;
                        nombreEstatus = element.status.status;
                        break;
                    case 10:
                        Capacitacion += minutos;
                        userId = element.userId;
                        nombre = element.user.name;
                        status = element.statusId;
                        nombreEstatus = element.status.status;
                        break;
                    case 1:
                        Calidad += minutos;
                        userId = element.userId;
                        nombre = element.user.name;
                        status = element.statusId;
                        nombreEstatus = element.status.status;
                        break;
                    case 2:
                        Sanitario += minutos;
                        userId = element.userId;
                        nombre = element.user.name;
                        status = element.statusId;
                        nombreEstatus = element.status.status;
                        break;
                    case 3:
                        Comida += minutos;
                        userId = element.userId;
                        nombre = element.user.name;
                        status = element.statusId;
                        nombreEstatus = element.status.status;
                        break;
                    case 4:
                        Break += minutos;
                        userId = element.userId;
                        nombre = element.user.name;
                        status = element.statusId;
                        nombreEstatus = element.status.status;
                        break;
                    case 5:
                        Llamada += minutos;
                        userId = element.userId;
                        nombre = element.user.name;
                        status = element.statusId;
                        nombreEstatus = element.status.status;
                        break;
                        
                }
                let object = {
                    nombre: `${nombre}:${nombreEstatus}`,
                    userId: userId,
                    Status: status,
                    minutos: minutos
                }
                // Diferencias.push("Minutos:" + minutos+ "\nEstatus:"+ element.statusId + "\nUserId:"+ userId);
                Usuarios.push(object)
            }
        });

        console.log(Usuarios);

        // new Resolver().success(res, "Minutos Por Agente");
        new Resolver().success(res, "Minutos Por Agente", Usuarios);
        
        /* FORMA ANTERIOR DEL METODO
        let user = req.body.userId;
        let status = req.body.statusId;
        let today = req.body.today

        console.log(`Fecha en base de datos: ${fecha}`);
        console.log(`Fecha en la maquina: ${now}`);        
        console.log(`Id Usuario: ${user}`);
        console.log(`Id Status: ${status}`);

        let minutos = now.diff(fecha, "m");
        console.log(minutos);
        console.log(`Minutos en el estado ${status}: ${minutos}`);
        
        new Resolver().success(res, "minutos totales", minutos);
        new Resolver().success(res, "minutos totales");
        console.log("Fecha desde la computadora:", fechaConvertida);
        console.log("Fecha en la API:", now);
        
        let horaTotal = now.diff(fecha, "m");
        
        console.log("diferencia de minutos de las fechas:", horaTotal);
        new Resolver().success(res, "minutos");


        
        const startDate = await getRepository(OpeStatusTime)
        .createQueryBuilder("status")
        .where("status.userId = :userId", {userId: user})
        .andWhere("status.statusId = :statusId", {statusId: status})
        .andWhere("status.endingTime IS NULL")
        .andWhere("status.startingDate = :startingDate", {startingDate: today})
        .orderBy("status.id", "DESC")
        .limit(1)
        .getOne();

        //*INNER JOIN OPESTATUSTIME CON CAT USER
        //*OPESTATUSTIME LOS TIEMPOS
        //*CAT USER LOS USUARIOS LOGUEADOS
        const startDate = await getRepository(OpeStatusTime)
        .createQueryBuilder()
        .select("status.startingDate")
        .from(OpeStatusTime, "status")
        .where("status.userId = :userId", {userId: user})
        .andWhere("status.statusId = :statusId", {statusId: status})
        .andWhere("status.endingTime IS NULL")
        .andWhere("status.startingDate = :startingDate", {startingDate: today})
        .orderBy("status.id", "DESC")
        .limit(1)
        .execute()
        */
        }
        catch(ex){
            new Resolver().error(res, "Error[GetTimeCurrentStatus]", ex)
        }
    }
}