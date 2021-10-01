import { Router, urlencoded } from "express";
import { ChatWebController } from "../controllers/chatweb-controller";

export class ChatWebRouting{
    public router:Router;
    private chatWebController:ChatWebController;

    constructor(){
        this.router = Router();
        this.chatWebController = new ChatWebController();
        this.routes();
    }

    private routes(): void{
        this.router.get('/chat', this.chatWebController.SendMessageToClient);
        this.router.post('/chat', this.chatWebController.ReceiveMessageToClient);
    }
}