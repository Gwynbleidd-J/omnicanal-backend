import { Router } from 'express';
import { NetworkController } from '../controllers/network-controller';

export class NetworkRouting{
    public router:Router;
    private networkController:NetworkController;

    constructor(){
        this.router = Router();
        this.networkController =  new NetworkController();
        this.routes();
    }

    private routes(): void{
        this.router.get('/networks', this.networkController.getNetWorks);
    }
}