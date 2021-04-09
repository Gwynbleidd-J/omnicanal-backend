import { MessengerController } from './../controllers/messenger-controller';
// import { WhatsappController } from './../controllers/whatsapp-controller';
import { Router } from "express";

export class MessengerRouting{
    public router: Router;
    private messengerControler: MessengerController;

    constructor() {
        this.router = Router();
        this.messengerControler = new MessengerController();
        this.routes();
    }

    private routes(): void {
        console.log('entrando al routing');
        this.router.post('/', this.messengerControler.incommingMessage);
    }
}