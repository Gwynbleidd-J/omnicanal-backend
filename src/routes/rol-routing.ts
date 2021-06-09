import { Router } from 'express';
import { RolController } from "../controllers/rol-controller";



export class RolRouting {
    public router:Router;
    private rolController:RolController;

    constructor(){
        this.router = Router();
        this.rolController = new RolController();
        this.routes();
    }
    

    private routes(): void{
        this.router.post('/', this.rolController.getRols);
    }
}