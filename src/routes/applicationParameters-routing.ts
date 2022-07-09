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
        this.router.post('/getCredentials', this.ParametersController.GetSoftphoneUserCredentials);
        this.router.post('/softphoneParameters', this.ParametersController.UpdateSoftphoneParameters);
        this.router.get('/getUsers', this.ParametersController.GetUsers);
        this.router.post('/getUserData',this.ParametersController.GetUserData);
        this.router.post('/saveUser', this.ParametersController.SaveNewUser);
        this.router.post('/updateUser', this.ParametersController.UpdateUser);
        this.router.post('/deleteUser', this.ParametersController.DeleteUser);
        // this.router.get('/getAppParametersDB', this.ParametersController.GetParametersFromDataBase);
        //this.router.get('/getSoftphoneParameters', this.ParametersController.GetSoftphoneParameters);
    }

    ///Ya se recuperan la informacion de los parametros de la aplicacion en general
}