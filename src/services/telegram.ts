require('dotenv').config();
import { Telegraf } from 'telegraf';
// import { TelegramController  } from '../controllers/telegram-controller';
import { MessengerController  } from '../controllers/messenger-controller';
 
export class Telegram{
    private telegraf:Telegraf;
    private telegramController:MessengerController

    constructor() {
        this.telegraf = new Telegraf(process.env.BOT_TOKEN)
        this.initListeners();
        this.telegraf.launch();
        this.telegramController = new MessengerController(this.telegraf);
    }

    public initListeners(): void {
        this.telegraf.start(ctx => {
            ctx.reply("Hola. Gracias por escribir al Telegram de PromoEspacio. En un momento le enlazamos con un agente.");
        });
        
        this.telegraf.on('text', ctx =>{
            // this.telegramController.sendMessages(ctx);
            this.telegramController.standardizeMessageContext(ctx, 't');
            // console.log(ctx.message.text);
        }); 
    }
}