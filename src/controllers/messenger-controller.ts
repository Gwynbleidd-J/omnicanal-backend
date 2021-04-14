import { CatUsers } from './../models/user'; 
import { Whatsapp } from '../services/whatsapp';
import { NextFunction, Request, Response } from "express";
import { OpeChats } from './../models/chat';
import { getRepository, SimpleConsoleLogger, UpdateResult } from "typeorm";
import { Resolver } from "../services/resolver";
import { Telegraf } from 'telegraf';
import {TelegramController} from '../controllers/telegram-controller';

 
export class MessengerController {
    
    private telegraf:Telegraf;
    private contextoGenerico:any;

    constructor(telegraf?:Telegraf) {
        this.telegraf = telegraf;
    }
    
    /* #region Comments */
    /*
    Método:     incommingMessage
    Parámetros:  Recibe el request que viene desde la petición hecha a la API. 
    Descripción: Se llama este método específicamente cuando el mensaje entrante es de whatsapp, dentro e proceso redirecciona
                hacia el método de estandarización de los mensajes. Se pasa como parámetro la letra 'W' para indicar que es un
                mensaje desde whatsapp.
    Devuelve:  
    Creó: J. Carlos Lara
    Fecha: Abril 09 de 2021
    */
   /* #endregion */ 
    public async incommingMessage(req:Request, res:Response): Promise<void> {
        try{  
            // console.log('Cuerpo del mensaje recibido');  
            MessengerController.prototype.standardizeMessageContext(req.body,'w');            
        }
        catch(ex){
            new Resolver().exception(res, 'Unexpected error.', ex);
            console.log('Error[incommingMessage]:' + ex);
        }
    }

    /*MÉTODO:       messageIn(Método original para enviar el msg de bienvenida, de espera y el de comunicación activa)
      Descripción:  Capta el mensaje enviado por el cliente
                    En este punto, validar si ya existe un chat activo de este cliente o sería un mensaje de bienvenida

    */
    // public async messageIn(req:Request, res:Response): Promise<void> {
    //     try {
    //         var incomingMessage = req.body.Body;
    //         if(incomingMessage != undefined)
    //         {
    //             // console.log(req.body);
    //             console.log(req.body.From + ' dice: ' + incomingMessage); 
    //             const chat = await getRepository(OpeChats)
    //             .createQueryBuilder("chat")
    //             .where("chat.platformIdentifier = :platformIdentifier", {platformIdentifier: 'w'})
    //             // .andWhere("chat.clientPlatformIdentifier = :clientPlatformIdentifier", {clientPlatformIdentifier: req.body.From})
    //             // .andWhere("chat.statusId = chat.statusId", {statusId: 1})
    //             .getOne();
  
                
    //             if(chat) 
    //                 {
    //                     console.log(chat);                    
    //                     console.log('Chat con estatus: ' + chat.statusId);
    //                     console.log('Chat asignado a: ' + chat.userId); 

    //                     if(chat.statusId == 1)  //El cliente ya mandó un mensaje previo, pedirle que espere
    //                         new Whatsapp().replyMessageWaitingForAgent(req.body.Body, req.body.ProfileName , req.body.From); 
    //                     else if(chat.statusId == 2)//Ya tiene chat en comunicación, despachar el msj al agente
    //                         console.log('Algo más en que pueda apoyarte?');
    //                 }
    //             else
    //             {
    //                 console.log('No existe un chat activo aún');
    //                 console.log('Registrando chat...');
                    
    //                 getRepository(OpeChats)
    //                 .createQueryBuilder()
    //                 .insert()
    //                 .into(OpeChats) 
    //                 .values([
    //                     {clientPlatformIdentifier: req.body.From, clientPhoneNumber: req.body.WaId, comments: req.body.Body, platformIdentifier: 'w', statusId: 1 } 
    //                 ])
    //                 .execute();

    //                 new Whatsapp().sendWelcomeMessage(req.body.ProfileName , req.body.From); 
    //             } 
                    
    //         }
    //     }
    //     catch(ex) {
    //         new Resolver().exception(res, 'Unexpected error.', ex);
    //         console.log(ex);
    //     }
    // }
  

    // public messageIn(messageContext:JSON) {
    //     try {
    //          console.log(messageContext);
    //     }
    //     catch(ex) { 
    //         console.log(ex);
    //     }
    // }
    public async messageIn(messageContext:JSON){
        try{ 
            //Pasos para el mensaje entrante:
            console.log('Procesando mensaje entrante de: ' + messageContext['clientPlatformIdentifier']);
            const existingChat = await this.chatAlreadyExist(messageContext['clientPlatformIdentifier'], messageContext['platformIdentifier']);
            //Verificar existencia del mismo 
            const jsonExistingChat = await existingChat; 
 
            if(jsonExistingChat.statusId == 0){
                console.log('Chat sin registro previo, generando registro inicial en BD...');
                const insertedChatId = await this.registryInitialChat(messageContext); 
                const jsonInsertedChat = await insertedChatId; 
                messageContext['id'] = insertedChatId; 
                this.sendWelcomeMessage(messageContext);
                const disponibleAgent = await this.getDisponibleAgent(messageContext['platformIdentifier']);
                const jsonDisponibleAgent = await disponibleAgent;
                console.log('Agente disponible: ' + jsonDisponibleAgent.userId + ' con identificador: ' + jsonDisponibleAgent.agentPlatformIdentifier);                 
                const assignedChat = await this.assignChatAgent(jsonDisponibleAgent.userId, messageContext);
                
                if(assignedChat){    //Enviar el mensaje al agente asignado
                    messageContext['userId'] = jsonDisponibleAgent.userId;  
                    messageContext['agentPlatformIdentifier'] = jsonDisponibleAgent.agentPlatformIdentifier; 
                    this.replyMessageForAgent(messageContext);
                }
                else
                    console.log('No se pudo asignar a ningún agente por el momento');
            }
            else if(jsonExistingChat.statusId == 1){
                console.log('Chat previo sin agente, volviendo a canalizar...'); 
                messageContext['id'] = jsonExistingChat.id;
                const disponibleAgent = await this.getDisponibleAgent(messageContext['platformIdentifier']);
                const jsonDisponibleAgent = await disponibleAgent;
                console.log('Agente disponible: ' + jsonDisponibleAgent.userId + ' con número: ' + jsonDisponibleAgent.agentIdentifierWhatsapp);                 
                const assignedChat = await this.assignChatAgent(jsonDisponibleAgent.userId, messageContext);

                if(assignedChat){    //Enviar el mensaje al agente asignado 
                    messageContext['userId'] = jsonDisponibleAgent.userId;  
                    messageContext['agentPlatformIdentifier'] = jsonDisponibleAgent.agentPlatformIdentifier; 
                    this.replyMessageForAgent(messageContext);  
                }
                else
                    console.log('No se pudo asignar a ningún agente por el momento'); 
            }
            else if(jsonExistingChat.statusId == 2){
                console.log('Chat, activo, dirigiendo el mensaje a su agente en turno...');  
                messageContext['id'] = jsonExistingChat.id;
                const agentPlatformIdentifier = await this.getAgentPlatformIdentifierForMessageContext(jsonExistingChat.userId, messageContext['platformIdentifier']);
                const jsonAgentPlatformIdentifier = await agentPlatformIdentifier;
                console.log('Identificador obtenido:' + jsonAgentPlatformIdentifier.agentPlatformIdentifier);
                messageContext['agentPlatformIdentifier'] = jsonAgentPlatformIdentifier.agentPlatformIdentifier;
            
                if(messageContext['agentPlatformIdentifier'])
                    this.replyMessageForAgent(messageContext);
                else
                console.log('Algo salió mal al obtener el contacto del agente');
            }
        }
        catch(ex)
        {
            console.log('Error[messageIn]:' + ex);
        }
    }
 
  
    public async registryInitialChat(messageContext:JSON):Promise<number>{
        try{ 
            const insertedOpeChat = await getRepository(OpeChats)
                            .createQueryBuilder() 
                            .insert() 
                            .into(OpeChats) 
                            .values([ 
                                {clientPlatformIdentifier: messageContext['clientPlatformIdentifier'], clientPhoneNumber: messageContext['clientPhoneNumber'], comments: messageContext['comments'], platformIdentifier: messageContext['platformIdentifier'], statusId: 1 } 
                            ])
                            .execute();  
            return insertedOpeChat.identifiers[0]['id'];
        }
        catch(ex){
            console.log('Error[registryInitialChat]:' + ex);
        }
    }

    public sendWelcomeMessage(messageContext:JSON):void{
        try{ 
            if(messageContext['platformIdentifier'] == 'w')
                new Whatsapp().sendWelcomeMessage(messageContext['clientPlatformIdentifier']); 
            else if(messageContext['platformIdentifier'] == 't')
                console.log('Enviar mensaje de bienvenida desde Telegram.');
        }
        catch(ex){
            console.log('Error[sendWelcomeMessage]:' + ex);
        }
    }

    public replyMessageWaitingForAgent(messageContext:JSON):void{
        try{ 
            if(messageContext['platformIdentifier'] == 'w')
                new Whatsapp().replyMessageWaitingForAgent(messageContext['clientPlatformIdentifier']); 
            else if(messageContext['platformIdentifier'] == 't')
                console.log('Enviar mensaje de espera desde Telegram.');
        }
        catch(ex){
            console.log('Error[replyMessageWaitingForAgent]:' + ex); 
        }
    }

    public replyMessageForAgent(messageContext:JSON):void{
        try{     
                if(messageContext['platformIdentifier'] === 'w'){ 
                    new Whatsapp().replyMessageForAgent(messageContext['comments'], messageContext['clientName'], messageContext['agentPlatformIdentifier']);
                }
                else if(messageContext['platformIdentifier'] === 't'){ 
                    console.log('Redirigir el mensaje de Telegram al agente');
                }
        }
        catch(ex){
            console.log('Error[replyMessageForAgent]:' + ex);
        }
    }

    /* #region Comments */
    /*
    Método:     chatAlreadyExist
    Parámetros: clientPlatformIdentifier[Identificador del cliente asignado en Twilio]
                platformIdentifier['w' o 't' segpún la plataforma desde donde está entrando el mensaje]
    Descripción: Valida la existencia de un chat activo con el cliente que realiza la petición  
    Devuelve: Un Int[Number] con el status_Id del chat[en caso de haber un registro]
                0[No hay registro, hay que generar uno nuevo]
                1[El cliente ya había iniciado un chat pero aún no se le ha asignado un agente]
                2[El chat del cliente ya está en proceso con un agente(idear como enlazar ese mensaje al agente)]

    Creó: J. Carlos Lara
    Fecha: Abril 08 de 2021
    */
   /* #endregion */ 
    public async chatAlreadyExist(clientPlatformIdentifier:String, platformIdentifier:String):Promise<any>{
        statusId:Number;
        try{  
            const chat = await getRepository(OpeChats)
                .createQueryBuilder("chat")
                .where("chat.platformIdentifier = :platformIdentifier", {platformIdentifier: platformIdentifier})
                .andWhere("chat.clientPlatformIdentifier = :clientPlatformIdentifier", {clientPlatformIdentifier: clientPlatformIdentifier})
                .andWhere("chat.statusId != :statusId", {statusId: 3})
                .orderBy("chat.id", "DESC")
                .getOne();

            let payload; 

            if(chat)
            {
                payload = {
                    id: chat.id,
                    statusId: chat.statusId, 
                    userId: chat.userId
                };
               return payload;
            }
            else 
            {
                payload = {
                    id: '',
                    statusId: '0', 
                    userId: null
                };
              return payload;
            }

        }
        catch(ex){
            console.log('Error[chatAlreadyExist]: ' + ex)
        }
    }

    /* #region Comments */
    /*
    Método:     
    Parámetros:  
    Descripción:Este método se llama al momento de recibir un nuevo whatsapp/telegram, se manda 
    Devuelve:   un objeto JSON para poder usarse se forma genérica en los métodos del controlador de mensajes

    Creó: J. Carlos Lara
    Fecha: Abril 08 de 2021
    */
   /* #endregion */ 
   //public standardizeMessageContext(Ctx:any, platformIdentifier:String){ 
    public standardizeMessageContext(ctx, platformIdentifier:String): void{
        try{ 
            let messageContext;
            
            if(platformIdentifier == 't')
            { 
                //Generar el JSON a partir del ctx de Telegram
                const Context:JSON = <JSON><unknown>{
                    "id": '', 
                    "clientPlatformIdentifier": ctx.from.id, 
                    "clientPhoneNumber": '', 
                    "comments": ctx.message.text, 
                    "platformIdentifier": platformIdentifier 
                    , "clientName": ctx.from.first_name 
                    , "userId": '' 
                    , "agentPlatformIdentifier": '' 
                  }
                  messageContext = Context;
            }
            else if(platformIdentifier == 'w')
            {
                //Generar el JSON a partir del ctx de Whatssap
                    const Context:JSON = <JSON><unknown>{
                    "id": '',
                    "clientPlatformIdentifier": ctx.From, 
                    "clientPhoneNumber": ctx.WaId, 
                    "comments": ctx.Body, 
                    "platformIdentifier": platformIdentifier
                    , "clientName": ctx.ProfileName
                    , "userId": ''
                    , "agentPlatformIdentifier": ''
                  }
                  messageContext = Context;
            }
 
            if(messageContext['clientPlatformIdentifier'] != 'whatsapp:+14155238886')
            {
                console.log('Mensaje estandarizado correctamente, enviando al despachador...');            
                this.messageIn(messageContext);
            }
            
        }
        catch(ex){ 
            console.log('Error[standardizeMessageContext]: ' + ex);
        }
    }

    public async getDisponibleAgent(platformIdentifier:String):Promise<any>{
        try{ 
            const user = await getRepository(CatUsers)
                .createQueryBuilder("user")
                .where(" user.activeChats < :activeChats", {activeChats: 2})  
                // .andWhere(" user.statusId = :statusId", {statusId: 1}) //Contemplar después añadir el filtro para el estatus del usuario
                .orderBy(" user.activeChats", "ASC") 
                .getOne();

            let payload; 

            if(user)
            {
                payload = {
                    userId: user.ID,  
                    activeChats: user.activeChats
                };  
                if(platformIdentifier === 'w')
                    payload['agentPlatformIdentifier'] = user.agentIdentifierWhatsapp;
                else
                    payload['agentPlatformIdentifier'] = user.agentIdentifierTelegram;
                console.log(payload);
                return payload;
            }
            else 
            {
                payload = {
                    userId: 0,  
                    agentPlatformIdentifier: '',
                    activeChats: 0                   
                };
              return payload;
            }
        }
        catch(ex)
        {
            console.log('Error[getDisponibleAgent]: ' + ex);
        }
    }

    public async assignChatAgent(agentId:any, messageContext:JSON):Promise<boolean>{
        let updateResult:boolean;

        try{  
            const updatedChat = await getRepository(OpeChats)
                .createQueryBuilder()
                .update(OpeChats)
                .set({ userId: agentId, statusId: 2})
                .where("id = :id", { id: messageContext['id'] })
                .execute();  
            // console.log(updatedChat); 

            if(updatedChat.affected === 1) 
                updateResult = true;  
            else 
                updateResult =false; 

        }
        catch(ex){
            console.log('Error[assignChatAgent]' + ex);
            updateResult = false;
        }  
        return updateResult;
    }

    public async getAgentPlatformIdentifierForMessageContext(agentId:any, platformIdentifier:String):Promise<any>{
        try{ 
            console.log('Buscando registro del User ' + agentId + ' de plataforma ' + platformIdentifier)
            const user = await getRepository(CatUsers)
                .createQueryBuilder("user")
                .where(" user.ID = :id", {id: agentId})                   
                .getOne();

            let payload; 

            if(user)
            {
                payload = {
                    userId: user.ID,  
                    activeChats: user.activeChats
                };  
                if(platformIdentifier === 'w')
                    payload['agentPlatformIdentifier'] = user.agentIdentifierWhatsapp;
                else
                    payload['agentPlatformIdentifier'] = user.agentIdentifierTelegram;
                console.log(payload);
                return payload;
            }
            else 
            {
                payload = {
                    userId: 0,  
                    agentPlatformIdentifier: '',
                    activeChats: 0                   
                };
              return payload;
            }
        }
        catch(ex)
        {
            console.log('Error[getAgentPlatformIdentifierForMessageContext]: ' + ex);
        }
    }
}