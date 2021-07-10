import { Router } from "express";
import { AuthController } from "../controllers/auth-controller";

export class AuthRouting {
    public router: Router;
    private authController:AuthController;

    constructor() {
        this.router = Router();
        this.authController = new AuthController();
        this.routes();
    }

    private routes(): void {
        this.router.post('/', this.authController.signIn);
    }
}