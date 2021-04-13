import { Telegraf } from 'telegraf'; 
import { getRepository } from 'typeorm';
import { OpeChats } from '../models/chat';


export class TelegramController{
    private telegraf:Telegraf;

    constructor(telegraf:Telegraf) {
        this.telegraf = telegraf;
    }

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
    }
}