import { Whatsapp } from '../services/whatsapp';
import { NextFunction, Request, Response } from "express";
import { OpeChats } from './../models/chat';
import { getRepository, SimpleConsoleLogger } from "typeorm";
import { Resolver } from "../services/resolver";
import { Telegraf } from 'telegraf';
import { TIMEOUT } from 'dns';

 
export class MessengerController {
    
    private telegraf:Telegraf;
    private contextoGenerico:any;

    constructor(telegraf?:Telegraf) {
        this.telegraf = telegraf;
    }
     
    public async incommingMessage(req:Request, res:Response): Promise<void> {
        try{  
            console.log('Cuerpo del mensaje recibido');  
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

    public async messageIn(messageContextJson:JSON){
        try{ 
            //Pasos para el mensaje entrante:
            console.log('Procesando mensaje entrante...' + messageContextJson['clientPlatformIdentifier']);
            const existingChat = await this.chatAlreadyExist(messageContextJson['clientPlatformIdentifier'], messageContextJson['platformIdentifier']);
            //Verificar existencia del mismo
            console.log('Resultado de existencia: ' + existingChat);
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
                // .andWhere("chat.statusId != :statusId", {statusId: 3})
                .orderBy("chat.id", "DESC")
                .getOne();

            let payload = {
                statusId: chat.statusId,
                userId: chat.userId
            }
            
            return chat;

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
            // messageContext: JSON; 
            let messageContext;
            
            if(platformIdentifier == 't')
            { 
                //Generar el JSON a partir del ctx de Telegram
                const Context:JSON = <JSON><unknown>{
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
                    "clientPlatformIdentifier": ctx.From, 
                    "clientPhoneNumber": ctx.WaId,
                    "comments": ctx.Body,
                    "platformIdentifier": platformIdentifier
                  }
                  messageContext = Context;
            }

            //Una vez que se estandarizó un mensaje de cualquier plataforma(w/t), se llama al método para que despache el mensaje según su caso de uso.
            console.log(messageContext);
            console.log('Mensaje estandarizado correctamente, enviando al despachador...');            
            this.messageIn(messageContext);
            
        }
        catch(ex){ 
            console.log('Error[standardizeMessageContext]: ' + ex);
        }
    }

    //Método provisional para probar el funcionamiento de telegram con el controlador general
    public sendMessages(ctx) {
        ctx.telegram.sendMessage( ctx.from.id, `Hola, buen día ${ctx.from.first_name} en breve lo atiende un promotor`);
        
        getRepository(OpeChats)
        .createQueryBuilder()
        .insert()
        .into(OpeChats)
        .values([{
            clientPlatformIdentifier:ctx.from.id, comments: ctx.message.text, platformIdentifier: 't' } 
        ])
        .execute();

        console.log(`PromoEspacio: Hola, buen día ${ctx.from.first_name} en breve lo atiende un promotor`);
    }

}