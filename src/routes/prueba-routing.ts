import { Router } from 'express';
import { PruebaController } from '../controllers/prueba-controller';

export class PruebaRouting{
    public router:Router;
    private pruebaController:PruebaController;
    
    constructor(){
        this.router = Router();
        this.pruebaController = new PruebaController();
        this.routes();
    }
    
    private routes(): void{
        this.router.post('/', this.pruebaController.Prueba);
    }
}
