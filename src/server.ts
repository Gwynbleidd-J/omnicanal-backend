require('dotenv').config();

import express from "express";
import { createConnection } from "typeorm";
import { UserRouting } from './routes/user-routing';
import { AuthRouting } from './routes/auth-routing';
import { Resolver } from "./services/resolver"; 
import { MessengerRouting } from './routes/messenger-routing';
import {Telegram} from './services/telegram';

class Server {
    public app:express.Application;

    constructor() {
        this.app = express();
        this.config();
        this.loadRoutes();
        this.InitServices();
    }

    public config(): void {
        this.app.set('port', process.env.SERVER_PORT || 3000);
        this.app.use(express.urlencoded({ extended: true }));
    }

    public loadRoutes(): void {
        this.app.get('/api', (req, res) => { res.send({message: process.env.WELCOME_MESSAGE}) });
        this.app.use('/api/user', new UserRouting().router);
        this.app.use('/api/auth', new AuthRouting().router);
        this.app.use('/api/whatsapp', new MessengerRouting().router);

        this.app.get('*', (req, res) => new Resolver().notFound(res, 'Oops! This route not exists.'));
    } 

    public initDatabase(): void {
        createConnection().then(connect => {
            console.log(`Database connected`);
        }).catch(err => {
            console.log(`Can't connect to database: ${err}`);
        });
    }

    public start(): void {
        this.app.listen(this.app.get('port'), () => {
            console.log(`Server listen on port: ${this.app.get('port')}`);
            this.initDatabase();
        });
    }

    //Init para el servicio de Telegram 
    public InitServices() {
        new Telegram();
    }
}

const server = new Server();
server.start();