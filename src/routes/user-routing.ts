import { Router } from "express";
import { UserController } from "../controllers/user-controller";

export class UserRouting{
    public router: Router;
    private userController:UserController;

    constructor() {
        this.router = Router();
        this.userController = new UserController();
        this.routes();
    }

    private routes(): void {
        this.router.post('/', this.userController.register);
        this.router.post('/myAgents', this.userController.getUsers);
        this.router.post('/agentInfo', this.userController.getUserDetail);
        this.router.post('/agentUpdateActiveIp', this.userController.updateUserActiveIp);
        //this.router.post('/agentUpdateActiveChats',this.userController.updateActiveChats);
    }
}