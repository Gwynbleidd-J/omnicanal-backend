import { Telegraf } from 'telegraf'; 
import { getRepository } from 'typeorm';
import { OpeChats } from '../models/chat';
import { Telegram } from '../services/telegram';



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
    /*
    bot.onText(/\/keyboard/, (msg) => {
   bot.sendMessage(msg.chat.id, 'Alternative keybaord layout', {
       'reply_markup': {
           'keyboard': [['Sample text', 'Second sample'], ['Keyboard'], ['I\'m robot']],
           resize_keyboard: true,
           one_time_keyboard: true,
           force_reply: true,
       }
   });
}); 
     */
}