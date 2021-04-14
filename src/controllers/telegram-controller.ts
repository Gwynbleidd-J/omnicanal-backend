import { Telegram } from '../services/telegram';
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { Telegraf } from 'telegraf';
import { Resolver } from '../services/resolver';
import { Utils } from "../services/utils";
import { getRepository } from 'typeorm';
import { OpeChats } from '../models/chat';


export class TelegramController{
    private telegraf:Telegraf;

    constructor(telegraf:Telegraf) {
        this.telegraf = telegraf;
    }

    public sendMessages(ctx) {
        ctx.telegram.sendMessage( ctx.from.id, `Hola, buen día ${ctx.from.first_name} en breve lo atiende un promotor`);
        console.log(ctx.from)
        getRepository(OpeChats)
        .createQueryBuilder()
        .insert()
        .into(OpeChats)
        .values([{
            clientPlatformIdentifier:ctx.from.id, comments: ctx.message.text, platformIdentifier: 't' } 
        ])
        .execute();
    }

    //Tienes que ir viendo como guardar fotos en los eventos de ctx.on()
} 