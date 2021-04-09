import { Whatsapp } from '../services/whatsapp';
import { NextFunction, Request, Response } from "express";
 
import { OpeChats } from './../models/chat';
import { getRepository } from "typeorm";

import { Resolver } from "../services/resolver";

 
export class MessengerController {
    
    public async newMessage(req:Request, res:Response): Promise<void> {
        try{            
            if(this.incommingMessage(req.body, 'w') != null)
                this.messageIn();
        }
        catch(ex){
            new Resolver().exception(res, 'Unexpected error.', ex);
            console.log(ex);
        }
    }

    /*MÉTODO:       messageIn
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


    public bool messageIn(Ctx:JSON, platformIdentifier:String) {
        try {
            var incomingMessage = req.body.Body;
            if(incomingMessage != undefined)
            {
                // console.log(req.body);
                console.log(req.body.From + ' dice: ' + incomingMessage); 
                const chat = await getRepository(OpeChats)
                .createQueryBuilder("chat")
                .where("chat.platformIdentifier = :platformIdentifier", {platformIdentifier: 'w'})
                // .andWhere("chat.clientPlatformIdentifier = :clientPlatformIdentifier", {clientPlatformIdentifier: req.body.From})
                // .andWhere("chat.statusId = chat.statusId", {statusId: 1})
                .getOne();
  
                
                if(chat) 
                    {
                        console.log(chat);                    
                        console.log('Chat con estatus: ' + chat.statusId);
                        console.log('Chat asignado a: ' + chat.userId); 

                        if(chat.statusId == 1)  //El cliente ya mandó un mensaje previo, pedirle que espere
                            new Whatsapp().replyMessageWaitingForAgent(req.body.Body, req.body.ProfileName , req.body.From); 
                        else if(chat.statusId == 2)//Ya tiene chat en comunicación, despachar el msj al agente
                            console.log('Algo más en que pueda apoyarte?');
                    }
                else
                {
                    console.log('No existe un chat activo aún');
                    console.log('Registrando chat...');
                    
                    getRepository(OpeChats)
                    .createQueryBuilder()
                    .insert()
                    .into(OpeChats) 
                    .values([
                        {clientPlatformIdentifier: req.body.From, clientPhoneNumber: req.body.WaId, comments: req.body.Body, platformIdentifier: 'w', statusId: 1 } 
                    ])
                    .execute();

                    new Whatsapp().sendWelcomeMessage(req.body.ProfileName , req.body.From); 
                } 
                    
            }
        }
        catch(ex) {
            new Resolver().exception(res, 'Unexpected error.', ex);
            console.log(ex);
        }
    }

    public async messageOut(req:Request, res:Response, next:NextFunction): Promise<void> {
         
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
    public chatAlreadyExist(clientPlatformIdentifier:String, platformIdentifier:String):number{
        statusId:Number;
        try{
            existingChat:Number;
            const chat = getRepository(OpeChats)
                .createQueryBuilder("chat")
                .where("chat.platformIdentifier = :platformIdentifier", {platformIdentifier: platformIdentifier})
                .andWhere("chat.clientPlatformIdentifier = :clientPlatformIdentifier", {clientPlatformIdentifier: clientPlatformIdentifier})
                .andWhere("chat.statusId = chat.statusId", {statusId: 1})
                .getOne();
  
                if(chat){
                    console.log(chat);
                    return 1;
                }
        }
        catch(ex){
            console.log('Error: ' + ex)
        }
    }

    /* #region Comments */
    /*
    Método:     incommingMessage
    Parámetros:  
    Descripción:Este método se llama al momento de recibir un nuevo whatsapp/telegram, se manda 
    Devuelve:   un objeto JSON para poder usarse se forma genérica en los métodos del controlador de mensajes

    Creó: J. Carlos Lara
    Fecha: Abril 08 de 2021
    */
   /* #endregion */ 
    public incommingMessage(Ctx=null, platformIdentifier:String): JSON{
        try{
            // messageContext: JSON; 
            let messageContext;
            
            if(platformIdentifier == 't')
            { 
                //Generar el JSON a partir del Ctx de Telegram
                const Context:JSON = <JSON><unknown>{
                    "clientPlatformIdentifier": Ctx.from.id, 
                    "clientPhoneNumber": '',
                    "comments": Ctx.message.text,
                    "platformIdentifier": platformIdentifier
                  }
                  messageContext = Context;
            }
            else if(platformIdentifier == 'w')
            {
                //Generar el JSON a partir del Ctx de Whatssap
                    const Context:JSON = <JSON><unknown>{
                    "clientPlatformIdentifier": Ctx.From, 
                    "clientPhoneNumber": Ctx.WaId,
                    "comments": Ctx.Body,
                    "platformIdentifier": platformIdentifier
                  }
                  messageContext = Context;
            }

            return messageContext;
        }
        catch(ex){ 
            console.log('Error: ' + ex);
        }
    }

}