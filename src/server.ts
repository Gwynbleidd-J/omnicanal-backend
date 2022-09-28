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
import { SoscketIOServer } from './services/SocketIOServer';
import path from 'path';
import * as socketio from 'socket.io';
import { getRepository } from "typeorm";
import { Request, Response } from "express";
 
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
import { CatAppParameters } from './models/appParameters';
import { PruebaRouting } from './routes/prueba-routing';
import { ScreenShareRouting } from './routes/screenShare-routing';
import { CallsRouting } from './routes/calls-routing';
import { MessengerController } from './controllers/messenger-controller';
import { CatUsers } from './models/user';



export class Server {
    public app:express.Application;
    public mySocket:Socket;
    public udpSocket:UDPSocket;
    public telegram:Telegram;
    public socketio:SoscketIOServer;
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
        this.app.use('/api/chatweb',express.static(path.join(__dirname, 'public')));
        this.app.use('/api/monitor', express.static(path.join(__dirname, 'monitor')));
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
        //this.mySocket = new Socket(); 
        //this.udpSocket = new UDPSocket();
        //this.mySocket.initSocketServer();
        //this.udpSocket.InitUDPServer();
    }
    
    public InitSocketIO():void{
        global.socketIOArraySockets = [];
        global.io = new socketio.Server(this.server, {
                cors:{
                    origin: '*',
                    methods:["GET", "POST"]
                },
                pingInterval: 25000,
                pingTimeout: 20000,
            })
        // this.io = new socketio.Server(this.server, {
        //     cors:{
        //         origin: '*',
        //         methods:["GET", "POST"]
        //     },
        // })

        //new SoscketIOServer(this.io);
        global.io.on('connection', (socket)=>{
            console.log(`New Connection with global variable: ${socket.handshake.address}:${socket.id}`);
            global.socketIOArraySockets.push(socket);
            console.log(socket.connected);

            socket.emit('port',{
                socketPort: socket.id   
            });

            socket.on('client-message', data =>{
                new MessengerController().standardizeIncommingMessage(data, 'c');
            })

            socket.on('agent-data', data => {
                console.log('datos desde agente', data);
                socket.emit('data-agent', data);
            });
                //    Console.WriteLine("Socket_OnConnected");
                //    var socket = sender as SocketIO;
                //    Console.WriteLine($"SocketId: {socket.Id}");
                //    //await treatNotificationAsync(socket);
                //    await socket.EmitAsync("hi", DateTime.Now.ToString());
                //    await socket.EmitAsync("agent-data", new Models.Message
                //    {
                //        messagePlatformId = GlobalSocket.message.messagePlatformId,
                //        text = GlobalSocket.message.text,
                //        transmitter = GlobalSocket.message.transmitter,
                //        statusId = GlobalSocket.message.statusId,
                //        chatId = GlobalSocket.message.chatId,
                //        clientPlatformIdentifier = GlobalSocket.message.clientPlatformIdentifier,
                //        platformIdentifier = GlobalSocket.message.agentPlatformIdentifier,
                //        agentPlatformIdentifier = GlobalSocket.message.agentPlatformIdentifier
                //    });

            //console.log(`Array: ${global.socketIOArraySockets}`);

            socket.on('error', error =>{
                console.log("Error en el socket:" +error);
                if(error && error.message === "unauthorized event" ){
                    socket
                }
            });

            socket.on('disconnect', async (close)=>{

                console.log("\n\n*******************\nAntes de borrar el arreglo se ve asi: ");
                global.socketIOArraySockets.forEach(element => {
                    console.log("Socket:"+ element.id);
                });
                console.log("Cantidad de sockets: "+global.socketIOArraySockets.length);

                console.log(`A client has disconnect: ${socket.handshake.address}:${socket.id}`);
                global.socketIOArraySockets.pop(socket.id);
                socket.disconnect(close);
                // console.log(`Socket disconnect: ${close}`);

                //*este bloque de código es para si una vez la aplicación crashea ponga la columna de activo de
                //* cat users en 0 que es cuando el usuario no ha iniciado sesión.

                let user = await getRepository(CatUsers)
                .createQueryBuilder()
                .update(CatUsers)
                .set({ activo: 0 })
                .where("activeIp = :socketId", {socketId: socket.id})
                .execute()

        
                if(user.affected === 1){
                    console.log('La columna activo se modifico correctamente a valor 0')
                }

                console.log("Despues de borrar se ve asi: ");
                global.socketIOArraySockets.forEach(element => {
                    console.log("Socket:"+ element.id);
                });
                console.log("Cantidad de sockets: "+global.socketIOArraySockets.length);

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

    private async UpdateActiveColumnOnClose(req:Request, res:Response):Promise <void>{
        
        let user = await getRepository(CatUsers)
        .createQueryBuilder()
        .update(CatUsers)
        .set({ activo: 0 })
        .where("ID = :userId", {userId: req.body.userId})
        .execute()

        if(user.affected === 1){
            console.log('La columna activo se modifico correctamente a valor 0')
            new Resolver().success(res, 'activo column has change correctly');
        }
    }

}

const server = new Server();
server.start();