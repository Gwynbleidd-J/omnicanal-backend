//Libraries Import
require('dotenv').config();
import { Socket } from './services/socket';
import { UDPSocket } from './services/UdpSocket';
import 'reflect-metadata'
import express from "express";
import { createConnection, Connection } from 'typeorm';
import  cors from 'cors';
import { Resolver } from "./services/resolver"; 
import {Telegram} from './services/telegram';
import { SocketIO } from './services/socketIO';
import path from 'path';
 import * as socketio from 'socket.io';
require('fs')
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
import { ParametersRouting } from './routes/applicationParameters-routing';
import { getRepository } from "typeorm";
import { CatAppParameters } from './models/appParameters';
import { Console } from 'console';
import { ChatController } from './controllers/chat-controller';
import { UserController } from './controllers/user-controller';
import { PruebaRouting } from './routes/prueba-routing';
import { ScreenShareRouting } from './routes/screenShare-routing';
import { CallsRouting } from './routes/calls-routing';
import morganMiddleware from './utils/morgan';


export class Server {
    public app:express.Application;
    public mySocket:Socket;
    public udpSocket:UDPSocket;
    public telegram:Telegram;
    public socketio:SocketIO;
    public io:socketio.Server;
    public server:any;
    public dataObject:any;
    
    constructor() {
        this.dataObject = [];
        global.appParameters = this.dataObject;
        this.app = express();
        this.config();
        this.InitServices();
        this.loadRoutes();

    }

    public config(): void {
        this.app.set('port', process.env.SERVER_PORT || 3000);
        this.app.use('/api/chatweb', express.static(path.join(__dirname, 'public')));
        this.app.use('/api/monitoreo',express.static(path.join(__dirname, 'screen')));
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(cors());
        this.app.use(express.json());
        this.app.use(express.urlencoded({extended: true}));
        this.app.use(morganMiddleware);
    }

    public loadRoutes(): void {
        this.app.get('/',cors(), (req, res,) =>{
            res.status(200).send('Hello World');
        })
        this.app.get('/api', (req, res) => { res.send({message: process.env.WELCOME_MESSAGE}) });
        this.app.use('/api/user', new UserRouting().router);
        this.app.use('/api/auth', new AuthRouting().router);
        //this.app.use('/api/whatsapp', new MessengerRouting().router); 
        //declarar las rutas para el pedido y organización de los mensajes 
        this.app.use('/api/messenger', new MessengerRouting(this.telegram.telegraf).router);
        this.app.use('/api/menu', new MenuRouting().router);
        this.app.use('/api/permission', new PermissionRouting().router);
        this.app.use('/api/rol', new RolRouting().router);
        this.app.use('/api/chat', new ChatRouting().router);
        this.app.use('/api/network', new  NetworkRouting().router);
        this.app.use('/api/status', new StatusRouting().router);
        this.app.use('/api/parameters', new ParametersRouting().router)
        this.app.use('/api/prueba', new PruebaRouting().router);
        this.app.use('/api/record', new ScreenShareRouting().router);
        this.app.use('/api/calls', new CallsRouting().router);
        this.app.get('*', (req, res) => new Resolver().notFound(res, 'Oops! This route not exists.'));
    } 

    public initDatabase(): void {
        createConnection().then(connect => {
            console.log(`PostgreSQL Database connected on ${connect.name}`);
            //this.AppParameters();
        }).catch(err => {
            console.log(`Can't connect to database: ${err}`);
        });
    }

    public start(): void {
       this.server = this.app.listen(this.app.get('port'), () => {
            console.log(`Server listen on port: ${this.app.get('port')}`);
            this.initDatabase();
            this.InitSocketIO();
            
        });        
    }

     //Metodo InitServices
    public InitServices():void {
        this.telegram = new Telegram();
        this.mySocket = new Socket(); 
        //this.udpSocket = new UDPSocket();
        this.mySocket.initSocketServer();
        //this.udpSocket.InitUDPServer();
    }
    
    public InitSocketIO():void{
        global.socketIOArraySockets = [];
        this.io = new socketio.Server(this.server, {
            cors:{
                origin: '*',
                methods:["GET", "POST"]
            },
        })

        this.io.on('connection', (socket)=>{
            console.log(`New Connection: ${socket.handshake.address}:${socket.id}`);
            global.socketIOArraySockets.push(socket)
            //console.log(`Array: ${global.socketIOArraySockets}`);
            
            new SocketIO().IOEventOn('client-message', socket);
            //new SocketIO().IOEventOn('no-client', socket);

            socket.on('disconnect', ()=>{
                console.log(`A client has disconnect: ${socket.handshake.address}:${socket.id}`);
                global.socketIOArraySockets.pop(socket.id);
                //console.log(`Array: ${global.socketIOArraySockets}`);

                //Deteccion de cliente desconectado
                // let chat = await new ChatController().getChatBySocket(socket.id);
                // let agent = await new UserController().getAgentById(chat.userId);


                let notificationString = '{"SocketInterrumpido": "' + socket.handshake.address + '"}';
                console.log('Notificacion del lider: ' + notificationString);
                socket.write(notificationString);
            });

        });
    }    

    public async AppParameters():Promise<void>{
        try{
            const botToken = await getRepository(CatAppParameters)
            .createQueryBuilder("parameters")
            .select(["parameters.twilioAccountSID", "parameters.twilioAuthToken", "parameters.whatsappAccount", "parameters.botTokenTelegram"])
            .where("id = :id" ,{ id:1 })
            .getOne();
            //console.log(botToken , "\n");
            let jsonData = JSON.stringify(botToken);
            let jsonParsed = JSON.parse(jsonData);
            //console.log(jsonParsed);
        }
        catch(ex){
            console.log(`Unexpected error ${ex}`)
        }
    }

}

const server = new Server();
server.start();