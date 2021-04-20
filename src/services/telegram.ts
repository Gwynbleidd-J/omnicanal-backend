require('dotenv').config();
import { Telegraf } from 'telegraf';
// import { TelegramController  } from '../controllers/telegram-controller';
import { MessengerController  } from '../controllers/messenger-controller';
import net from "net";
 
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
            
            //Implementación temporal del direccionamiento de un mensaje de Telegram hacia los sockets
            var client = new net.Socket();
            client.connect(8000, 'localhost', ()=>{
                console.log('[ImpresionDeCliente] Cliente local conectado');
                client.write('Recibido por Telegram:' + ctx.message.text);
            });

            client.on('data', data => {
                console.log(` [ImpresionDeCliente] Received from server: ${data}`);
            });

            client.on('close', () => {
                console.log(' [ImpresionDeCliente] Connection closed');
            }); 
            //Implementación temporal

        }); 
    }
}