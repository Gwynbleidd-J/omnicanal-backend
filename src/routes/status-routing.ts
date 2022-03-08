import { Router } from "express";
import { StatusUserController } from '../controllers/status-controller';
import { StatusTimeController } from "../controllers/statusTime-controller";

export class StatusRouting{
    public router:Router;
    private statusCotroller: StatusUserController;
    private statusTimeController: StatusTimeController;

    constructor(){
        this.router = Router();
        this.statusCotroller = new StatusUserController();
        this.statusTimeController = new StatusTimeController();
        this.routes();
    }

    private routes(): void{
        this.router.get('/', this.statusCotroller.getUserStatus);
        this.router.post('/updateUserStatus',this.statusCotroller.updateUserStatus);//falta el contolador
        this.router.post('/setStarTime',this.statusTimeController.SetStatusTime);
        this.router.post('/changeStatus', this.statusTimeController.ChangeStatus);
        this.router.post('/updateOnClosing', this.statusTimeController.UpdateAfterClose);
        this.router.post('/totalTime', this.statusTimeController.TotalTime);
        this.router.post('/GetUserStates', this.statusTimeController.GetUserStates)
        //te falta la ruta par que te de todos los status
        //mera formalidad
    }

    //falta que definas las rutas el controlador ya esta
}