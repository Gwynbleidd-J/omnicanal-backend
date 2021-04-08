import { Telegram } from '../services/telegram';
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { Telegraf } from 'telegraf';
import { Resolver } from '../services/resolver';
import { Utils } from "../services/utils";


export class TelegramController{
    private telegraf:Telegraf;

    constructor(telegraf:Telegraf) {
        this.telegraf = telegraf;
    }

    public sendMessages(ctx) {
        ctx.telegram.sendMessage( ctx.from.id, `Hola, buen día ${ctx.from.first_name} en breve lo atiende un promotor`);
        ctx.telegram.sendMessage(ctx.chat.id, ctx.update.message.text);
        console.log(ctx.chat.id);
    }

    //Tienes que ir viendo como guardar fotos en los eventos de ctx.on()
} 