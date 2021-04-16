require('dotenv').config();
// import { Server } from 'http';
import { Telegraf } from 'telegraf';
import { TelegramController } from '../controllers/telegram-controller';  


export class Telegram{
    private telegraf:Telegraf;
    private telegramController:TelegramController

    constructor() {
        this.telegraf = new Telegraf(process.env.BOT_TOKEN)
        this.initListeners();
        this.telegraf.launch();
        this.telegramController = new TelegramController(this.telegraf);
    }

    public initListeners(): void {
        this.telegraf.start(ctx => {
            ctx.reply("Bienvenido");
        });
        
        this.telegraf.on('text', ctx =>{
            this.telegramController.sendMessages(ctx);
            console.log(ctx)  
        }); 


    }
    /* 
    public sendMessages(){
         this.telegraf.on('text', ctx =>{
             let chatId = ctx.chat.id;
             let from = ctx.from.id;
             let firstName = ctx.from.first_name;
             let message = ctx.update.message.text;
            ctx.telegram.sendMessage(chatId ? from : 1624174766, `Hola, buen día ${firstName} en breve lo atiende un promotor`);
            ctx.telegram.sendMessage(chatId ? 1488122635 : 1624174766, message);
            console.log(ctx);
        });
    }
    */

    public sendMessages(mensaje:string, destiny:string){
        this.telegraf.telegram.sendMessage(destiny,mensaje);
    }

    public responseMessage(message:string, destiny:string){
        this.telegraf.telegram.sendMessage(destiny,message)
    }

}