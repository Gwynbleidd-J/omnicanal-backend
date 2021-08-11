import { Telegraf } from 'telegraf';
import { MessengerController } from './../controllers/messenger-controller';
// import { WhatsappController } from './../controllers/whatsapp-controller';
import { Router } from "express";

export class MessengerRouting{
    public router: Router;
    private messengerControler: MessengerController;

    constructor(telegraf:Telegraf) {
        this.router = Router();
        this.messengerControler = new MessengerController();
        this.routes();
    }

    private routes(): void {
        console.log();
        this.router.post('/whatsapp', this.messengerControler.whatsappIncommingMessage);
        //Implementar métodos para poder recuperar el último mensaje o en su caso, el histórico de todos los msjs
        this.router.post('/recoverActiveChats', this.messengerControler.recoverActiveChats);
        this.router.post('/', this.messengerControler.getMessages);
        this.router.post('/outMessage', this.messengerControler.outcommingMessage);
        this.router.post('/newEmptyChat', this.messengerControler.createEmptyChat);
    }
}