import { NextFunction, Request, Response } from "express";
import { Connection, createQueryBuilder, getRepository, Repository } from "typeorm";
import { Resolver } from '../services/resolver';
import { Utils } from "../services/utils";
import { OpeChats } from '../models/chat';
import { CatUsers } from '../models/user';
import { Console } from "console";
import { MessengerController } from "./messenger-controller";
import { UserController } from "./user-controller";
import { Socket } from './../services/socket';

export class ChatController {
    public async closeChat(req: Request, res: Response): Promise<void> {
        try {
            console.log(`Cerrando chat con id: ${req.body.chatId}`);

            const updatedActiveChats = await getRepository(OpeChats)
                .createQueryBuilder()
                .update(OpeChats)
                .set({ statusId: 3 })
                .where("id = :id", { id: req.body.chatId })
                .execute();
            // console.log(updatedChat);


            if (updatedActiveChats.affected === 1) {


                //let chatO = await (this.getChatAgent.bind(this)(req.body.chatId));

                let chat = await this.getChatById(req.body.chatId)
                new MessengerController().NotificateLeader("FC", chat.userId, chat, null);

                console.log('Chat cerrado correctamente'); //updateResult = true;
                new Resolver().success(res, 'Chat correctly finished');
            }
            else {
                console.log('No se pudo cerrar correctamente el chat'); //updateResult =false; 
            }

        }
        catch (ex) {
            new Resolver().exception(res, 'Unexpected error.', ex);
        }
    }

    public async getChatById(chatId: any) {
        try {
            console.log("\nObteniendo agente asignado al chat...");
            const Chat = await getRepository(OpeChats)
                .createQueryBuilder("chat")
                .where("chat.id = :id", { id: chatId })
                .getOne();

            //let agentId = Chat.userId;
            return Chat;
        } catch (error) {
            console.log("Error[getChatById]chat-controller:" + error);
        }
    }

    public async getChatByIdRequest(req: Request, res: Response){
        try {
            let chatId = req.body.chatId;
            const chat = await getRepository(OpeChats)
            .createQueryBuilder("chat")
            .where("chat.id = :id",{ id: chatId })
            .getOne();

            if (chat) {
                new Resolver().success(res, "Se consulto el chat correctamente", chat)
            }else{
                new Resolver().exception(res,"A ocurrido un error inesperado");
            }

        } catch (error) {
            console.log("[getChatByIdRequest]Ha ocurrido un error:"+error)
        }

    }

    public async subtractActiveChat(req: Request, res: Response): Promise<void> {
        try {
            const actualActiveChats = await getRepository(CatUsers)
                .createQueryBuilder("user")
                .where("user.ID = :id", { id: req.body.userId })
                .getOne();

            let actualActiveChatsCuantity: any;
            if (actualActiveChats) {
                actualActiveChatsCuantity = {
                    actualActiveChats: actualActiveChats.activeChats
                }
                actualActiveChatsCuantity['actualActiveChats'] = actualActiveChatsCuantity['actualActiveChats'] - 1;
            }

            if (actualActiveChatsCuantity['actualActiveChats'] >= 0) {
                const subtractActiveChats = await getRepository(CatUsers)
                    .createQueryBuilder()
                    .update(CatUsers)
                    .set({ activeChats: actualActiveChatsCuantity['actualActiveChats'] })
                    .where("ID = :id", { id: req.body.userId })
                    .execute();

                if (subtractActiveChats.affected === 1) {
                    //console.log('Campo activeChats modificado correctamente')
                    new Resolver().success(res, 'ActiveChat correctly modified');
                }
                else {
                    console.log('No se pudo modificar correctamente el campo ActiveChats');

                }
            }
            else {
                console.log(`El agente no tiene chats asignados`)
                new Resolver().success(res, 'ActiveChat has zero value')
            }
        }
        catch (ex) {
            new Resolver().exception(res, 'Unexpected error.', ex);
        }
    }

    public async updateNetworkCategory(req: Request, res: Response): Promise<void> {
        try {
            console.log(`Agregando NetCategory al id: ${req.body.chatId}`);
            const updateNetworkCategory = await getRepository(OpeChats)
                .createQueryBuilder()
                .update(OpeChats)
                .set({ networkCategoryId: req.body.networkId })
                .where("id = :id", { id: req.body.chatId })
                .execute();

            if (updateNetworkCategory.affected === 1) {
                console.log('Network Category Asignado Correctamente');
                new Resolver().success(res, 'Network Category correctly inserted');
            }
            else {
                console.log('No se pudo actualizar Network Category en OpeChats');
            }

        }
        catch (ex) {
            new Resolver().exception(res, 'Unexpected error', ex);
        }
    }

    public async getChatBySocket(socket: any) {
        try {
            console.log("\nObteniendo chat enlazado al socket...");
            const chat = await getRepository(OpeChats)
                .createQueryBuilder("chat")
                .where("chat.clientPlatformIdentifier = :clientPlatformIdentifier", { clientPlatformIdentifier: socket })
                .getOne();

            //let agentId = Chat.userId;
            console.log("Chat obtenido:" + JSON.stringify(chat));
            return chat;
        } catch (error) {
            console.log("Error[getChatBySocket]chat-controller:" + error);
        }
    }

    public async getActiveChats(req: Request, res: Response) {
        try {
            console.log("Obteniendo chats activos");
            const chats = await getRepository(OpeChats)
                .createQueryBuilder("chats")
                .innerJoinAndSelect("chats.user", "user")
                .where("chats.statusId =:statusId", { statusId: 2 })
                .getMany();
            let cids = [];
            chats.forEach(chat => {

                let platform;
                let startTime = chat.startTime;
                let startDate = chat.date;

                let year = Number.parseInt(startDate.toString().split('-')[0]);
                let month = Number.parseInt(startDate.toString().split('-')[1]) - 1;
                let day = Number.parseInt(startDate.toString().split('-')[2]);

                let hour = Number.parseInt(startTime.toString().split(':')[0]);
                let minute = Number.parseInt(startTime.toString().split(':')[1]);
                let second = Number.parseInt(startTime.toString().split(':')[2]);

                let date = new Date(year, month, day, hour, minute, second);
                let returnDate = date.toLocaleDateString() + " " + date.toLocaleTimeString()

                switch (chat.platformIdentifier) {
                    case "t":
                        platform = "Telegram"
                        break;
                    case "w":
                        platform = "WhatsApp"
                        break;
                    case "c":
                        platform = "Chat Web"
                        break;
                }


                let object = {
                    "chatId": chat.id,
                    "asignedAgent": chat.user.name + " " + chat.user.paternalSurname + " " + chat.user.maternalSurname,
                    "userId": chat.userId,
                    "startTime": returnDate,
                    "platformIdentifier": platform,
                    "activeChats": chat.user.activeChats,
                    "maxActiveChats": chat.user.maxActiveChats
                }

                cids.push(object);
            });
            console.log("Se obtuvieron estos chats:" + JSON.stringify(cids));

            if (chats) {
                new Resolver().success(res, 'Chats correctly consulted', cids);
            }
            else {
                new Resolver().exception(res, 'Something went wrong with chats info.');
            }

            //return cids;

        } catch (error) {
            console.log("Error[getActiveChats]chat-controller" + error);
            new Resolver().exception(res, 'Unexpected error.', error);
        }
    }

    public BarridoSockets(idSocket, objetoEnvio){

        try {
            let sentNotification = 0;
            let copiaGlobalArraySockets = global.globalArraySockets;
            copiaGlobalArraySockets.forEach(element => {
                console.log("Comprobando "+element.remotePort+ " y "+ idSocket)
                if (element.remotePort == idSocket && sentNotification < 1) {
                    console.log("Enviando notificacion a "+idSocket);
                    let notificationString = JSON.stringify(objetoEnvio);
                    console.log("Data enviada al socket:" +notificationString);
                    element.write(notificationString);
                    sentNotification ++
                }
            });
        } catch (error) {
            console.log("Ha ocurrido un error inesperado:" +error);
        }
    }

    public async transferChat(req: Request, res: Response) {

        try {
            let idAgenteAnterior = req.body.idAntiguo;
            let idAgenteNuevo = req.body.idNuevo;
            let idChat = req.body.idChat;
            let idSupervisor = req.body.idSupervisor;

            const agenteAnterior = await getRepository(CatUsers)
            .createQueryBuilder("agent")
            .where("agent.ID = :id", { id : idAgenteAnterior})
            .getOne();

            const agenteNuevo = await getRepository(CatUsers)
            .createQueryBuilder("NewAgent")
            .where("NewAgent.ID = :id",{ id : idAgenteNuevo})
            .getOne();

            const Supervisor = await getRepository(CatUsers)
            .createQueryBuilder("supervisor")
            .where("supervisor.ID = :id", { id: idSupervisor})
            .getOne();

            let datoActualizadoAgenteAnterior = agenteAnterior.activeChats -1;
            let datoActualizadoAgenteNuevo = agenteNuevo.activeChats +1;

            const agenteAnteriorAfectado = await getRepository(CatUsers)
            .createQueryBuilder()
            .update(CatUsers)
            .set({ activeChats: datoActualizadoAgenteAnterior})
            .where("ID = :id", {id : idAgenteAnterior})
            .execute();

            const agenteNuevoAfectado = await getRepository(CatUsers)
            .createQueryBuilder()
            .update(CatUsers)
            .set({activeChats: datoActualizadoAgenteNuevo})
            .where("ID = :id", {id: idAgenteNuevo})
            .execute();

            const chatAfectado = await getRepository(OpeChats)
            .createQueryBuilder()
            .update(OpeChats)
            .set({ userId: idAgenteNuevo})
            .where("id = :chatId", { chatId: idChat})
            .execute();

            let chat = await new ChatController().getChatById(idChat);

            let objetoAgenteNuevo = {
                "chatId" : chat.id,
                "openTransferChat": null,
            }

            let objetoAgenteAnterior = {
                "chatId" : chat.id,
                "closeTransferChat" : null
            }

            let objetoPruebaSupervisor= {
                "chatId" : chat.id,
                "closeTransferChat": null,
            }

            new ChatController().BarridoSockets(agenteNuevo.activeIp, objetoAgenteNuevo);
            new ChatController().BarridoSockets(agenteAnterior.activeIp, objetoAgenteAnterior);
            //new ChatController().BarridoSockets(Supervisor.activeIp, objetoPruebaSupervisor)

            console.log("\nAgente anterior afectado:"+ JSON.stringify(agenteAnterior.name)  + "\nAgente nuevo afectado:"+ JSON.stringify(agenteNuevo.name) + "\nChat afectado:"+ JSON.stringify(chat.id))

            if (agenteAnteriorAfectado.affected == 1 && agenteNuevoAfectado.affected == 1 && chatAfectado.affected == 1 && chat) {
                console.log("Se modificaron a los agentes y el chat corectamente");
                new Resolver().success(res, "Se completo la logica de la transferencia exitosamente");

            }else{
                console.log("No se pudieron modificar a los agentes o al chat correctamente");
                new Resolver().exception(res, "Ocurrio un error durante la logica de la transferencia");
            }


        } catch (error) {
            console.log("Ocurrio el siguiente error:" +error);
            new Resolver().exception(res, "UnexpectedError", error);
        }

    }

}