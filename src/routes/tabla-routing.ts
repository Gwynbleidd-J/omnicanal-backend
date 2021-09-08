import { Router } from "express";
import { TablaController } from "../controllers/tabla-controller";

export class TablaRouting{
    public router:Router;
    private tablaController: TablaController;

    constructor(){
        this.router = Router();
        this.tablaController = new TablaController();
        this.routes();
    }

    private routes(): void{
        this.router.post('/', this.tablaController.getData);
    }
}