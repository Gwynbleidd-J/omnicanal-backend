import { Router } from "express";
import { CallController } from "../controllers/call-controller";

export class CallsRouting{
    public router:Router;
    private callsController:CallController;

    constructor(){
        this.router = Router();
        this.callsController = new CallController();
        this.routes();
    }

    private routes(): void{
        this.router.post('/', this.callsController.RegistryIncomingCall);
        this.router.post('/updateNetworkCall', this.callsController.CallTypification);
        this.router.post('/getIdCall', this.callsController.getIdCall);
        this.router.post('/getTotalCalls', this.callsController.getTotalCalls)
        this.router.post('/getCallsUser', this.callsController.GetCalls);
        this.router.post('/user', this.callsController.UserHangUp);
        this.router.post('/vendor', this.callsController.VendorHangUp);
        // this.router.post('/phoneVendor', this.callsController.SetVendorNumber);
        // this.router.post('/phoneUser', this.callsController.SetUserNumber);
    }
}