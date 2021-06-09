import { Router } from "express";
import { StatusUserController } from '../controllers/status-controller';

export class StatusRouting{
    public router:Router;
    private statusCotroller: StatusUserController;

    constructor(){
        this.router = Router();
        this.statusCotroller = new StatusUserController();
        this.routes();
    }

    private routes(): void{
        this.router.get('/', this.statusCotroller.getUserStatus);
        this.router.post('/updateUserStatus',this.statusCotroller.updateUserStatus);//falta el contolador

        //te falta la ruta par que te de todos los status
        //mera formalidad
    }

    //falta que definas las rutas el controlador ya esta
}