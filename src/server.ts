//Libraries Import
require('dotenv').config();
import { Socket } from './services/socket';
import express from "express";
import { createConnection, Connection } from 'typeorm';
import cors from 'cors';
import { Resolver } from "./services/resolver"; 
import {Telegram} from './services/telegram';
import { SocketIO } from './services/socketIO';
// import path from 'path';
 import * as socketio from 'socket.io';
//Routes Imports
import { UserRouting } from './routes/user-routing';
import { AuthRouting } from './routes/auth-routing';
import { MessengerRouting } from './routes/messenger-routing'; 
import { MenuRouting } from './routes/menu-routing';
import { PermissionRouting } from './routes/permission-routing';
import { RolRouting } from './routes/rol-routing';
import { ChatRouting } from './routes/chat-routing';
import { NetworkRouting } from './routes/network-routing';
import { StatusRouting } from './routes/status-routing';
import { TablaRouting } from './routes/tabla-routing';



export class Server {
    public app:express.Application;
    public mySocket:Socket;
    public telegram:Telegram;
    public socketio:SocketIO;
    public io:socketio.Server;
    public server:any;
    public socket:any;
    
    constructor() {
        this.app = express();
        this.config();
        this.InitServices();
        this.loadRoutes();
        
    }

    public config(): void {
        this.app.set('port', process.env.SERVER_PORT || 3000);
        /* this.app.use(express.static(path.join(__dirname, 'public'))); */
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(cors());
        this.app.use(express.json());
        this.app.use(express.urlencoded({extended: true}));
    }

    public loadRoutes(): void {
        this.app.get('/',cors(), (req, res,) =>{
            res.status(200).send('Hello World');
        })
        this.app.get('/api', (req, res) => { res.send({message: process.env.WELCOME_MESSAGE}) });
        this.app.use('/api/user', new UserRouting().router);
        this.app.use('/api/auth', new AuthRouting().router);
        // this.app.use('/api/whatsapp', new MessengerRouting().router); 
        //declarar las rutas para el pedido y organización de los mensajes 
        this.app.use('/api/messenger', new MessengerRouting(this.telegram.telegraf).router);
        this.app.use('/api/menu', new MenuRouting().router);
        this.app.use('/api/permission', new PermissionRouting().router);
        this.app.use('/api/rol', new RolRouting().router);
        this.app.use('/api/chat', new ChatRouting().router);
        this.app.use('/api/network', new  NetworkRouting().router);
        this.app.use('/api/status', new StatusRouting().router);
        this.app.use('/api/tabla', new TablaRouting().router);
        this.app.get('*', (req, res) => new Resolver().notFound(res, 'Oops! This route not exists.'));
    } 

    public initDatabase(): void {
        
        /* createConnection().then(connect =>{
            console.log(`Databases connected`);
        }).catch(err =>{
            console.log(`Can't connect to database ${err}`);
        }); */
        createConnection("default").then(connect => {
            console.log(`PostgreSQL Database connected`);
        }).catch(err => {
            console.log(`Can't connect to database: ${err}`);
        });
        
        // createConnection("second-connection").then(connect =>{
        //     console.log(`Mysql Database connected`);
        // }).catch(err=>{
        //     console.log(`Can't connect to database: ${err}`);
        // });
    }

    public start(): void {
       this.server = this.app.listen(this.app.get('port'), () => {
            console.log(`Server listen on port: ${this.app.get('port')}`);
            this.initDatabase();
            this.InitSocketIO();
        });        
    }

    public InitServices():void {
        this.telegram = new Telegram();
        this.mySocket = new Socket(); 
        this.mySocket.initSocketServer();
    }
    
    public InitSocketIO():void{
        global.socketIOArraySockets = [];
        this.io = new socketio.Server(this.server, {
            cors:{
                origin: '*'
            },    
        })

        this.io.on('connection', (socket)=>{
            console.log(`New Connection: ${socket.handshake.address}:${socket.id}`);
            global.socketIOArraySockets.push(socket)
            //console.log(`Array: ${global.socketIOArraySockets}`);
            
            new SocketIO().IOEventOn('client-message', socket);

            new SocketIO().IOEventOn('no-client', socket);

            socket.on('disconnect', ()=>{
                console.log(`A client has disconnect: ${socket.handshake.address}:${socket.id}`);

                socket.emit('no-client', {
                    message: 'cliente desconectado'
                })
            });

        });
    }    
    //Metodo InitServices

}

const server = new Server();
server.start();