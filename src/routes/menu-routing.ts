import { Router } from "express";
import { MenuController } from './../controllers/menu-controller';

export class MenuRouting{
    public router: Router;
    private menuController:MenuController;

    constructor() {
        this.router = Router();
        this.menuController = new MenuController();
        this.routes();
    }

    private routes(): void {
        // this.router.get('/', this.menuController.getAllMenus);
        this.router.post('/', this.menuController.getMenu);        
        
    }
}