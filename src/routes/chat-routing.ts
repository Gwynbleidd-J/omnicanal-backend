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
        this.router.post('/subtractActiveChat', this.chatController.subtractActiveChat);
        this.router.get('/getAllActiveChats', this.chatController.getActiveChats);
        this.router.post('/transferChat', this.chatController.transferChat);
        this.router.post('/getChatByIdRequest', this.chatController.getChatByIdRequest);
        this.router.get('/getLastChatByUserId', this.chatController.getLastChatByIdUser);
        this.router.post('/getUserChats', this.chatController.getUserChats);
        this.router.post('/obtenerDatosChatDiarios', this.chatController.obtenerDatosChatDiarios)

    }
}