import { CatUsers } from './../models/user';
import { Telegram } from './../services/telegram';
import { Whatsapp } from '../services/whatsapp';
import { NextFunction, Request, Response } from "express";
import { OpeChats } from './../models/chat';
import { getRepository, SimpleConsoleLogger } from "typeorm";
import { Resolver } from "../services/resolver";
import { Telegraf } from 'telegraf';
 
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
            const myJson = await existingChat;
            console.log('Estatus del chat existente: ' + myJson.statusId); 

            if(myJson.statusId == 0){
                console.log('Chat con estatus: ' + myJson.statusId + ' generando registro inicial en BD.');
                this.registryInitialChat(messageContext);
            }
            else if(myJson.statusId == 1)
                console.log('Chat con estatus '+ myJson.statusId +', asignando un agente.');
            else if(myJson.statusId == 2)
                console.log('Chat con estatus '+ myJson.statusId +' dirigiendo el mensaje a su agente');
            //Dependiendo del estatus devuelto, redireccionamos el messageContextJson al mensaje de bienvenida o de seguimiento
        }
        catch(ex)
        {
            console.log('Error[messageIn]:' + ex);
        }
    }

    public async messageOut(req:Request, res:Response, next:NextFunction): Promise<any> {
     return new Promise((resolve, reject) => {setTimeout(() => {
         resolve(2);
     }, 1500);
    });
    } 
  
    public async registryInitialChat(messageContext:JSON):Promise<number>{
        try{
            console.log('Enrando a registryInitialChat');
            const insertedOpeChat = await getRepository(OpeChats)
                            .createQueryBuilder() 
                            .insert() 
                            .into(OpeChats) 
                            .values([ 
                                {clientPlatformIdentifier: messageContext['clientPlatformIdentifier'], clientPhoneNumber: messageContext['clientPhoneNumber'], comments: messageContext['comments'], platformIdentifier: messageContext['platformIdentifier'], statusId: 1 } 
                            ])
                            .execute(); 
            console.log(insertedOpeChat);

            return 2;
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
            {
                console.log('Diseñar la lógica para enviar msg a Telegram'); 
            }
        }
        catch(ex){
            console.log('Error[registryInitialChat]:' + ex);
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
            console.log('Buscando regstro de chat con ' + clientPlatformIdentifier + ', de tipo ' + platformIdentifier);
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
            console.log('Estandarizando cuerpo del mensaje'); 
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
                  }
                  messageContext = Context;
            }
 
            console.log('Mensaje estandarizado correctamente, enviando al despachador...');            
            this.messageIn(messageContext);
            
        }
        catch(ex){ 
            console.log('Error[standardizeMessageContext]: ' + ex);
        }
    }

    public async getDisponibleAgent(platformIdentifier:String):Promise<any>{
        try{ 
            const user = await getRepository(CatUsers)
                .createQueryBuilder("user")
                .where("user.activeChats < :activeChats", {activeChats: 3})  
                .andWhere("user.") //Contemplar después añadir el filtro para el estatus del usuario
                .orderBy("user.activeChats", "ASC")
                .getOne();

            let payload; 

            if(user)
            {
                payload = {
                    userId: user.ID, 
                    agentIdentifierWhatsapp: user.agentIdentifierWhatsapp, 
                    agentIdentifierTelegram: user.agentIdentifierTelegram, 
                    activeChats: user.activeChats
                };
               return payload;
            }
            else 
            {
                payload = {
                    userId: 0, 
                    agentIdentifierWhatsapp: '', 
                    agentIdentifierTelegram: '',
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

    public async assignChatAgent(agentId:number, messageContext:JSON):Promise<void>{
        try{ 
            await getRepository(OpeChats)
                .createQueryBuilder()
                .update(OpeChats)
                .set({ userId: agentId, statusId: 2})
                .where("id = :id", { id: messageContext['id'] })
                .execute();            
        }
        catch(ex){
            console.log('Error[assignChatAgent]' + ex);
        }
    }

}