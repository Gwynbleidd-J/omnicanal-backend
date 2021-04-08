import { Whatsapp } from '../services/whatsapp';
import { NextFunction, Request, Response } from "express";
 
import { OpeChats } from './../models/chat';
import { getRepository } from "typeorm";

import { Resolver } from "../services/resolver";
 
export class WhatsappController {
    /*MÉTODO:       messageIn
      Descripción:  Capta el mensaje enviado por el cliente
                    En este punto, validar si ya existe un chat activo de este cliente o sería un mensaje de bienvenida

    */
    public async messageIn(req:Request, res:Response): Promise<void> {
        try {
            var incomingMessage = req.body.Body;
            if(incomingMessage != undefined)
            {
                console.log(req.body);
                console.log(req.body.From + ' dice: ' + incomingMessage);

                //Primero, probar insertar un registro en ope_chats
                console.log('Registrando chat');
                //Probar si se puede hacer una instancia del modelo para poder darle datos específicos
                const chat = new OpeChats;
                chat.client = req.body.From;
                chat.comments = req.body.Body;
                chat.platformIdentifier = 'w';

                // getRepository(OpeChats).save(chat)
                // .then(result => new Resolver().success(res, 'Chat register succesfull', result))
                // .catch(error => new Resolver().error(res, 'Chat register error', error));

                getRepository(OpeChats)
                .createQueryBuilder()
                .insert()
                .into(OpeChats)
                .values([
                    { client: req.body.From, comments: req.body.Body, platformIdentifier: 'w' } 
                ])
                .execute();

                new Whatsapp().replyMessage(incomingMessage,req.body.ProfileName , req.body.From);
            }
        }
        catch(ex) {
            new Resolver().exception(res, 'Unexpected error.', ex);
            console.log(ex);
        }
    }

    public async messageOut(req:Request, res:Response, next:NextFunction): Promise<void> {
         
    } 
}