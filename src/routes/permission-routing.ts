import {Router} from "express";
import {PermissionController} from "../controllers/permission-controller";

export class PermissionRouting{
    public router: Router;
    private permissionController: PermissionController;

    constructor() {
        this.router = Router();
        this.permissionController = new PermissionController();
        this.routes();        
    }

    private routes(): void{
        this.router.post('/', this.permissionController.getRolPermissions);
    }
}