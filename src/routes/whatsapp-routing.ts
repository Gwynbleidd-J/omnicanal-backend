import { WhatsappController } from './../controllers/whatsapp-controller';
import { Router } from "express";

export class WhatsappRouting{
    public router: Router;
    private whatsappControler: WhatsappController;

    constructor() {
        this.router = Router();
        this.whatsappControler = new WhatsappController();
        this.routes();
    }

    private routes(): void {
        console.log();
        this.router.post('/', this.whatsappControler.messageIn);
    }
}