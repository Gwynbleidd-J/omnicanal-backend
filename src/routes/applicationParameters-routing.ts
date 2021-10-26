import { Router } from "express";
import { ParametersController } from '../controllers/parameters-controller';

export class ParametersRouting{
    public router:Router;
    private ParametersController:ParametersController;
    
    constructor(){
        this.router = Router();
        this.ParametersController = new ParametersController();
        this.routes();

    }

    private routes():void{
        this.router.post('/appParameters', this.ParametersController.AppParameters);
        this.router.post('/getCredentials', this.ParametersController.GetUserCredentials);
        this.router.get('/getAppParameters', this.ParametersController.GetAppParameters);
        this.router.post('/softphoneParameters', this.ParametersController.SoftphoneParameters);
        this.router.get('/getUsers', this.ParametersController.GetUsers);
        // this.router.get('/getAppParametersDB', this.ParametersController.GetParametersFromDataBase);
        //this.router.get('/getSoftphoneParameters', this.ParametersController.GetSoftphoneParameters);
    }

    ///Ya se recuperan la informacion de los parametros de la aplicacion en general
}