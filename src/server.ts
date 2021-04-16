require('dotenv').config();
import express from "express";
import { createConnection } from "typeorm";
import { UserRouting } from './routes/user-routing';
import { AuthRouting } from './routes/auth-routing';
import { Resolver } from "./services/resolver";
import { Telegram } from './services/telegram';
import { WhatsappRouting } from './routes/whatsapp-routing';
import  http from 'http';
import path from "path";
import net from "net";
import socket from 'socket.io';

class Server {
    public app:express.Application;
    public server: http.Server;

    constructor() {
        this.app = express();
        this.config();
        this.loadRoutes();
        this.initServices();
        this.sockets();
        this.netServer();
       // this.netClient();
    }
    
    public config(): void {
        this.app.set('port', process.env.SERVER_PORT);
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(express.static(path.join('public')));
    }
    
    public loadRoutes(): void {
        this.app.use(express.static(path.join(__dirname, 'public')));
        this.app.get('/api', (req, res) => { res.send({message: process.env.WELCOME_MESSAGE}) });
        this.app.use('/api/user', new UserRouting().router);
        this.app.use('/api/auth', new AuthRouting().router);
        this.app.use('/api/messages/whatsapp', new WhatsappRouting().router);
        this.app.get('*', (req, res) => new Resolver().notFound(res, 'Oops! This route not exists.'));
    }
    
    public initServices() {
        new Telegram();
    }

    public initDatabase(): void {
        createConnection().then(connect => {
            console.log(`Database connected`);
        }).catch(err => {
            console.log(`Can't connect to database: ${err}`);
        });
    }

    public start(): void {
        this.server = http.createServer(this.app).listen(this.app.get('port'), ()=>{
            console.log(`Server listening on port: ${this.app.get('port')}`);  
            this.initDatabase();
            this.sockets();
        });
    }
    public netServer():void{
        const host = "127.0.0.1"
        const port = 8124;
        let sockets = [];
        var netServer = net.createServer((socket)=>{
            console.log('client Connected')
            //socket.write('Message send from the server\r\n');
            socket.pipe(socket);

            socket.on('data', (data)=>{
                socket.listeners
            });

            socket.on('data', (data)=>{
                console.log(`client says: ${data}`);
                new Telegram().sendMessages('Agente dice: ' + data.toString(), '1743337519');
                sockets.forEach((socket, index, array)=>{
                    socket.write(data);
                })
            })
            
            socket.on('end', ()=>{
                console.log('client disconnected');
            });
            socket.on('error', (error)=>{
                console.log(error);
            });
        });
        netServer.listen(8124,()=>{
            console.log('Waiting for a connection');
        })

        let serviceSocket = net.connect(port, host, ()=>{
            console.log('Connected to remote');
        });

        serviceSocket.on('data', (data)=>{
            if(sockets.length ===0)
            {
                return;
            }

        });

    }

     /*        
     setTimeout(() => {
         socket.write('Message send from the server\r\n');
         socket.pipe(socket)
        }, 2000);
        setTimeout(() => {
            socket.on('end', ()=>{
                console.log('client disconnected')
            });
        }, 4000);
     */




/*     public netClient():void{
        var client = new net.Socket();
        client.connect(8124, 'localhost', ()=>{
            console.log('connected')
            client.write('Hello, server! Love, Client.');
        })

        client.on('data', (data)=>{
            console.log(`Received ${data}`)
        });

        client.on('close', function() {
            console.log('Connection closed');
        });
        
    } */

    public sockets():void{

    }
}
const server = new Server();
server.start();
        
/*
public sockets():void{
const io = require("socket.io")(this.server);
let users = [];
io.on('connection',(socket)=>{
    socket.emit('news', { nombre: 'Carlos'} )
        socket.on('clientEvent', (data)=>{
            console.log(data);
        });
    });
    } 
*/

/* 
        EVENTOS DEL SERVER
        .-Connect
        .-Message
        .-Disconnect
        .-Reconnect
        .-Ping
        .-Join and
        .-Leave

        EVENTOS CLIENT
        .-Connect
        .-Connect_error
        .-Connect_timeout
        .-Reconnect
        .-
        .-

        io.on('connection', (socket) => {
            console.log('New Connection:', socket.id);
            socket.on('chat:message', (data) => {
                io.sockets.emit('chat:message', data);
            });
        
            socket.on('chat:message', (data) => {
                socket.broadcast.emit('chat:typing', data)
            });
        });
        */

        /*
        métodos emit(para emitir eventos al cliente) y on(para escuchar eventos del cliente) del socket
            io.on('connection', function(socket){
          console.log(`client: ${socket.id}`)
          //enviando numero aleatorio cada dos segundo al cliente
          setInterval(() => {
          socket.emit('server/random', Math.random())
          }, 2000)
          //recibiendo el numero aleatorio del cliente
          socket.on('client/random', (num) => {
            console.log(num)
            })
            })
        */

        /* 

    }
        */
