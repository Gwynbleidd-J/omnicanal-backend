import { Request, Response } from "express";
import { getRepository, createConnection, QueryBuilder, Brackets } from 'typeorm';
import { CatUsers } from '../models/user';
import { CatRols } from './../models/rol';
import { Resolver } from '../services/resolver';
import { Utils } from "../services/utils";
import { CatAuxiliarStatuses } from '../models/auxiliarStatus';
import { OpeChats } from '../models/chat';
import { DeactivationsList } from "twilio/lib/rest/messaging/v1/deactivation";
import { CatComunicationStatuses } from "../models/comunicationStatus";
import { OpeCalls } from '../models/call';
import { MessengerController } from "./messenger-controller";

export class UserController {
    public async register(req: Request, res: Response): Promise<void> {
        try {
            req.body.password = await new Utils().encrypt(req.body.password);
            getRepository(CatUsers).save(req.body)
                .then(result => new Resolver().success(res, 'Register succesfull', result))
                .catch(error => new Resolver().error(res, 'Register error', error));
        }
        catch (ex) {
            new Resolver().exception(res, 'Unexpected error.', ex);
        }
    }

    public async getUsers(req: Request, res: Response): Promise<void> {
        try {
            console.log('Consultando a los agentes del supervisor con ID: ');
            console.log(req.body.leaderId);
            const users = await getRepository(CatUsers)
                .createQueryBuilder("users")
                .where("users.leaderId = :leaderId", { leaderId: req.body.leaderId })
                //.andWhere("users.rolID = :rolId", {rolId: 1}) //El rolId 1  hace refrerencia al rol de Agente[Después habría que diferenciar cada rol en la petición] 
                .orderBy("users.name", "ASC")
                .getMany();


            // const users = await getRepository(CatUsers);


            let payload;

            if (users) {
                payload = {
                    users: users
                };
                console.log(payload);
                new Resolver().success(res, 'Agents correctly consulted', payload);
            }
            else
                new Resolver().error(res, 'Something bad with agents info.');
        }
        catch (ex) {
            console.log('Error[getUsers]: ' + ex);
        }
    }

    public async getAllAgents(req: Request, res: Response) {
        try {
            console.log('\nObteniendo a todos los usuarios con rol 1: ');
            const users = await getRepository(CatUsers)
                .createQueryBuilder("users")
                .where("users.rolID = :rolId", { rolId: 1 })
                .orderBy("users.name", "ASC")
                .getMany();

            let payload;
            let asu = [];


            users.forEach(element => {
                let objeto = {
                    "agente": element.name + " " + element.paternalSurname + " " + element.maternalSurname,
                    "id": element.ID
                };

                asu.push(objeto);
            });

            if (users) {
                // payload = {
                //     users: users
                // };
                console.log("Usuarios obtenidos:" + JSON.stringify(payload));
                new Resolver().success(res, 'Agentes consultados', asu);
            }
            else
                new Resolver().error(res, 'Something bad with agents info.');
        }
        catch (ex) {
            console.log('Error[getUsers]: ' + ex);
        }
    }

    public async ValidateTransferAgent(req: Request, res: Response) {

        try {
            console.log("Validando si el agente puede recibir un chat");
            const agent = getRepository(CatUsers)
                .createQueryBuilder("agent")
                .where("agent.ID = :id", { id: req.body.id })
                .getOne();

            let activeChats = (await agent).activeChats;
            let maxActiveChats = (await agent).maxActiveChats;
            let status = (await agent).statusID;

            let imprimir = await agent;

            console.log("Estado del agente que esta siendo verificado:" + JSON.stringify(imprimir));

            let capacidad = activeChats < maxActiveChats ? true : false;
            let disponibilidad = status == 7 ? true : false;

            let estado = {
                capacidad,
                disponibilidad
            }

            if (agent) {
                new Resolver().success(res, "Agente consultado correctamente", estado);
            } else {
                new Resolver().exception(res, "Ha ocurrido un error consultando al agente");
            }
        } catch (error) {
            console.log("Error[ValidateTransferAgent]user-controller:"+error);
            new Resolver().exception(res, "Ocurrio un error", error);
        }

    }


    public async getCountCalls(req: Request, res: Response): Promise<void> {
        try {
            console.log('Consultando las llamadas en curso: ');
            const ongoingCalls = await getRepository(OpeCalls)
                .createQueryBuilder("calls")
                .select("SUM(calls.id)", "sum")
                .where("calls.statusId = :statusID", { statusID: 2 })
                .getRawOne();

            const finishedCalls = await getRepository(OpeCalls)
                .createQueryBuilder("calls")
                .select("SUM(calls.id)", "sum")
                .where("calls.statusId = :statusID", { statusID: 3 })
                .getRawOne();

            let payload;

            payload = {
                ongoingCalls: ongoingCalls.sum,
                finishedCalls: finishedCalls.sum
            };
            console.log(payload);
            new Resolver().success(res, 'Calls correctly consulted', payload);

            if (ongoingCalls) {
            }
            else
                new Resolver().error(res, 'Something bad with calls info.');
        }
        catch (ex) {
            console.log('Error[getUsers]: ' + ex);
        }
    }

    public async getUserDetail(req: Request, res: Response): Promise<void> {
        try {
            console.log(`Consultado el detalle del agente con ID:${req.body.userI}`);
            /* 
           const agent = await getRepository(CatUsers)
           .createQueryBuilder("user")
           .leftJoinAndSelect("user.rol", "rol")
           .leftJoinAndSelect("user.status", 'status')
           .leftJoinAndSelect("user.chat", "chat")
           .leftJoinAndSelect("user.call", "call")
           .where("user.ID = :id",{id: req.body.userId})
           .getOne();
           */

            const details = await getRepository(CatUsers)
                .createQueryBuilder("user")
                .leftJoin("user.chat", "chat")
                .leftJoinAndSelect("user.status", "status")
                .leftJoinAndSelect("user.rol", "rol")
                //.select(["user.name, user.paternalSurname, user.maternalSurname"])
                .where("user.ID = :id", { id: req.body.userId })
                .getOne();

            const solvedChats = await getRepository(CatUsers)
                .createQueryBuilder("user")
                .innerJoin("user.chat", "chat")
                .select(["COUNT (chat.statusId) AS solvedChats"])
                .where("user.ID = :id", { id: req.body.userId })
                .andWhere("chat.statusId = :statusId", { statusId: 3 })
                .getRawOne();

            const activeChats = await getRepository(CatUsers)
                .createQueryBuilder("user")
                .innerJoin("user.chat", "chat")
                .select(["COUNT (chat.statusId) AS activeChats"])
                .where("user.ID = :id", { id: req.body.userId })
                .andWhere("chat.statusId = :statusId", { statusId: 2 })
                .getRawOne();

            const solvedCalls = await getRepository(CatUsers)
                .createQueryBuilder("user")
                .innerJoin("user.call", "call")
                .select(["COUNT (call.statusId) AS solvedCalls"])
                .where("user.ID = :id", { id: req.body.userId })
                .andWhere("call.statusId = :statusId", { statusId: 3 })
                .getRawOne();

            const activeCalls = await getRepository(CatUsers)
                .createQueryBuilder("user")
                .innerJoin("user.call", "call")
                .select(["COUNT (call.statusId) AS activeCalls"])
                .where("user.ID = :id", { id: req.body.userId })
                .andWhere("call.statusId = :statusId", { statusId: 2 })
                .getRawOne();




            let payload = {
                details,
                solvedChats,
                activeChats,
                solvedCalls,
                activeCalls
            }


            if (payload) {
                new Resolver().success(res, 'Agent detail correctly consulted', payload); //payload
            }
            else {
                new Resolver().error(res, 'Something bad with agents info.');
            }
        }
        catch (ex) {
            console.log('Error[getUsersDetails]: ' + ex);
        }


    }

    public async updateUserActiveIp(req: Request, res: Response): Promise<void> {
        try {
            console.log('Actualizando el campo ActiveIp del Usuario')
            const activeIp = await getRepository(CatUsers)
                .createQueryBuilder()
                .update(CatUsers)
                .set({ activeIp: req.body.ipAddress })
                .where("email = :email", { email: req.body.email })
                .execute();

            if (activeIp.affected === 1) {

                let agent = await new UserController().getAgentByEmail(req.body.email);
                new MessengerController().NotificateLeader("NS", agent.ID, null, null);

                console.log('campo activeIp actualizado correctamente');
                new Resolver().success(res, 'activeIp Correctly modified');
            }
            else {
                console.log('No se puedo actualizar correctamente activeIp');
            }
        }
        catch (ex) {
            console.log(`Error[updateUserActiveIp ${ex}`);
        }
    }

    public async getAgentByEmail(email: any) {
        try {
            console.log("\nObteniendo agente iniciando sesion...");
            const agent = await getRepository(CatUsers)
                .createQueryBuilder("agent")
                .where("agent.email = :email", { email: email })
                .getOne();

            //let agentId = Chat.userId;
            console.log("Agente obtenido:" + JSON.stringify(agent));
            return agent;
        } catch (error) {
            console.log("Error[getAgentByEmail]user-controller:" + error);
        }
    }

    public async NotificateSessionClose(activeIP: any) {
        try {
            console.log("\nObteniendo agente cerrando sesion...");
            const agent = await getRepository(CatUsers)
                .createQueryBuilder("agent")
                .where("agent.activeIp = :activeIp", { activeIp: activeIP })
                .getOne();

            //let agentId = Chat.userId;
            new MessengerController().NotificateLeader("FS", agent.ID, null, null);
            console.log("Agente obtenido:" + JSON.stringify(agent));
            return agent;
        } catch (error) {
            console.log("Error[NotificateSessionClose]user-controller:" + error);
        }
    }

    public async getAgentById(agentId: any) {
        try {
            console.log("\nObteniendo agente");
            const agent = await getRepository(CatUsers)
                .createQueryBuilder("agent")
                .where("agent.ID = :id", { id: agentId })
                .getOne();

            //let agentId = Chat.userId;
            return agent;
        } catch (error) {
            console.log("Error[getAgentById]user-controller:" + error);
        }
    }

    public async updateMaxActiveChats(req: Request, res: Response): Promise<void> {
        try {
            console.log('Actualizando el campo MaxActiveChats del Usuario')
            const maxActiveChats = await getRepository(CatUsers)
                .createQueryBuilder()
                .update(CatUsers)
                .set({ maxActiveChats: req.body.maxActiveChats })
                .where("ID = :id", { id: req.body.id })
                .execute();

            if (maxActiveChats.affected === 1) {
                console.log('campo maxActiveChats actualizado correctamente');
                new Resolver().success(res, 'maxActiveChat Correctly modified');
            }
            else {
                console.log('No se pudo actualizar correctamente maxActiveChats');
            }
        }
        catch (ex) {
            console.log(`Error[updateMaxActiveChats ${ex}`);
        }
    }

}
