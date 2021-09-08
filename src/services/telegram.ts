require('dotenv').config();
import { Telegraf, Markup } from 'telegraf';
import { createTextChangeRange } from 'typescript';
// import { TelegramController } from '../controllers/telegram-controller';
import { MessengerController  } from '../controllers/messenger-controller';
import { TelegramController } from '../controllers/telegram-controller';

const TelegrafInlineMenu = require('telegraf-inline-menu')


export class Telegram{
    public telegraf:Telegraf;
    private telegramController:MessengerController;
    private telegrafController:TelegramController;

    constructor() {
        this.telegraf = new Telegraf(process.env.BOT_TOKEN)
        this.initListeners();
        this.telegraf.launch();
        this.telegramController = new MessengerController(this.telegraf);
        this.telegrafController = new TelegramController(this.telegraf);
    }

    public initListeners(): void {
        /* this.telegraf.start(ctx => {
            ctx.reply("Hola. Gracias por escribir al Telegram de PromoEspacio. En un momento le enlazamos con un agente."); 
        }); */
        
        this.telegraf.command('start', ctx =>{
            console.log('Bot Iniciado');
            ctx.reply('Bienvenido al Bot del centro de monitorio');
            ctx.reply('De clic en menu para seleccionar su sucursal');
            //this.telegraf.telegram.sendMessage(ctx.chat.id, 'Hola. Gracias por escribir al Telegram de PromoEspacio. En un momento le enlazamos con un agente.');
        });

        this.telegraf.telegram.setMyCommands([
            {command: 'elektra', description: "Ingresar al menu de ayuda de Elektra"},
            {command: 'marti', description: "Ingresar al menu de ayuda de Marti"},
            {command: 'uvc', description: "Ingresar al menu de ayuda de UVC"}
        ]); 
        
        this.telegraf.command('elektra', ctx => {
            ctx.telegram.sendMessage(ctx.from.id, 
                'Bienvenido al menu de Elektra. Seleccione la opcion que corresponda', 
                {reply_markup:{
                    inline_keyboard:[
                        [{text: "Video incorrecto en pantallas", callback_data:"1"},{text: "Pantallas en negro", callback_data:"2"}]
                    ]
                }},) 
        });
  
          this.telegraf.action('1', ctx =>{
            ctx.telegram.sendMessage(ctx.from.id,'Estan ordenadas correctamente las pantallas?',
            {reply_markup:{
              inline_keyboard:[
                [{text: 'Si', callback_data:"11"}, {text:'No', callback_data:'12'}]
              ]
            }})
          });
  
          this.telegraf.action('11', ctx =>{
            ctx.telegram.sendMessage(ctx.from.id,'Muestran algun error las pantallas?',
            {reply_markup:{
              inline_keyboard:[
                [{text: 'Si', callback_data:"111"}, {text:'No', callback_data:'112'}]
              ]
            }})
          });
  
          this.telegraf.action('111', ctx => {
            ctx.reply("Tome una foto y contacte a un agente de soporte");
          });
  
          this.telegraf.action('112', ctx =>{
            ctx.reply("Espere un momento por favor, en seguida le pondremos en contacto con un agente");
            this.telegraf.on('text', ctx => {
              this.telegramController.standardizeIncommingMessage(ctx,'t');  
            })  
          });
  
          this.telegraf.action('12', ctx =>{
            ctx.telegram.sendMessage(ctx.from.id,'Intente ordenarlas de manera correcta, se soluciono el problema?',
            {reply_markup:{
              inline_keyboard:[
                [{text: 'Si', callback_data:"121"}, {text:'No', callback_data:'122'}]
              ]
            }})
          });
  
          this.telegraf.action('121', ctx => {
            ctx.reply("Gracias por contactarnos, que tenga buen dia");
          });
  
          this.telegraf.command('marti', ctx => {
            ctx.telegram.sendMessage(ctx.from.id, 
              'Bienvenido al menu de Marti. Seleccione la opcion que corresponda', 
              {reply_markup:{
                inline_keyboard:[
                  [{text: "Video incorrecto en pantallas", callback_data:"3"},{text: "Pantallas en negro", callback_data:"4"}]
                ]
              }},
              )
          });
  
          this.telegraf.command('ubc', ctx => {
            ctx.telegram.sendMessage(ctx.from.id, 
              'Bienvenido al menu de UBC. Seleccione la opcion que corresponda', 
              {reply_markup:{
                inline_keyboard:[
                  [{text: "Video incorrecto en pantallas", callback_data:"5"},{text: "Pantallas en negro", callback_data:"6"}]
                ]
              }},
              )
          });

        this.telegraf.on('text', ctx =>{
            this.telegramController.standardizeIncommingMessage(ctx, 't');
        });
    }

    
    /* public initListeners(): void {
        this.telegraf.start(ctx => {
            ctx.reply("Hola. Gracias por escribir al Telegram de PromoEspacio. En un momento le enlazamos con un agente.");   
        });

        this.telegraf.on('text', ctx =>{
            // this.telegramController.sendMessages(ctx);
            this.telegramController.standardizeIncommingMessage(ctx, 't');

            // console.log(ctx);
            
            // //Implementación temporal del direccionamiento de un mensaje de Telegram hacia los sockets
            // var client = new net.Socket();
            // client.connect(8000, 'localhost', ()=>{
            //     console.log('[ImpresionDeCliente] Cliente local conectado');
            //     client.write('Recibido por Telegram:' + ctx.message.text);
            // });

            // client.on('data', data => {
            //     console.log(` [ImpresionDeCliente] Received from server: ${data}`);
            // });

            // client.on('close', () => {
            //     console.log(' [ImpresionDeCliente] Connection closed');
            // }); 
            // // //Implementación temporal
        });
        
    } */

    
}