import { Router } from 'express';
import { ChatController } from "../controllers/chat-controller";



export class ChatRouting {
    public router:Router;
    private chatController:ChatController;

    constructor(){
        this.router = Router();
        this.chatController = new ChatController();
        this.routes();
    }

    private routes(): void{
        this.router.post('/closeChat', this.chatController.closeChat);
        this.router.post('/updateNetworkCategory', this.chatController.updateNetworkCategory);
    }
}