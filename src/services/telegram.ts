require('dotenv').config();
import { Telegraf } from 'telegraf';


export class Telegram{

   public sendMessage(){
        const bot = new Telegraf(process.env.BOT_TOKEN)
        bot.on('text', ctx =>{
            //chatId = ctx.chat.id;
            //client = ctx.from.id;
            bot.telegram.sendMessage(1488122635 ? 1761464773 : 1624174766, `Hola ${ctx.from.first_name} en breve lo atiende un promotor`);
            bot.telegram.sendMessage(1488122635 ? 1488122635 : 1624174766, ctx.update.message.text);
            console.log(ctx.chat.id);
            bot.launch();
            //ctx.chat.id = ctx.chat.id ? 1761464773 : 1624174766, 
            //ctx.chat.id = ctx.chat.id ? 1488122635 : 1624174766,
        })
    }

}