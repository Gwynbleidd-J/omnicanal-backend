import { Telegram } from '../services/telegram';
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { Telegraf } from 'telegraf';
import { Resolver } from '../services/resolver';
import { Utils } from "../services/utils";


export class TelegramController{
    private telegraf:Telegraf;
    public sendMessages(chatId:number, from:number) {
         this.telegraf.on('text', ctx =>{
            let firstName = ctx.from.first_name;
            let message = ctx.update.message.text;
            ctx.telegram.sendMessage( from, `Hola, buen día ${firstName} en breve lo atiende un promotor`);
            ctx.telegram.sendMessage(chatId, message);
            console.log(ctx);
        });
    }
} 