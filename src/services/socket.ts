import { MessengerController } from './../controllers/messenger-controller';
import * as net from 'net';
import * as globalArraySockets from './global';

export class Socket {
    private mensajeBienvenida:String;
    public netServer:net.Server;
    public arraySockets:any;

    constructor(){
        // this.initSocketServer();
        console.log('constructor iniciado');
        this.arraySockets = [];    
        global.globalArraySockets = this.arraySockets;
    }

    public initSocketServer(): void { 
        this.netServer = net.createServer(socket => {
            this.arraySockets.push(socket);
            global.globalArraySockets.push(socket);

            //Intentando escribir en la variable global;        
            console.log(socket.remoteAddress + ' is now connected');

            socket.write('Bienvenido, este es el ejemplo de las notificaciones que enviaremos: ');
            socket.write('{"chatId": 158, "platformIdentifier": "w"}');

            socket.on("data", data =>  {          
                console.log(socket.remoteAddress + ' dice: ' + data.toString()); // prints the data  
                socket.write('\n Alguien dice: ' + data.toString());                  
                this.replyMessageForClient(socket.remoteAddress, data.toString());  
            });
             
            this.netServer.getConnections((error, count) => {
                console.log('Active clients: ' + count);
            });

            this.netServer.on('error',function(error){
                console.log('Error: ' + error);
            }); 

            socket.on('close',function(error){
                console.log('Socket closed!');
                if(error){
                  console.log('Socket was closed because of transmission error');
                }
              });

            socket.on('end', ()=>{ 
                console.log('SOCKET DISCONNECTED: '); 
            }); 


        }); 

        this.netServer.listen(8000); 
    }

    public replyMessageForAgent(messageContext:JSON, agentSocket:net.Socket): void{
        try{
            console.log('Esperando a enviar a ' +  messageContext['agentPlatformIdentifier']); 
            agentSocket.write('\n  ' +messageContext['clientName']+' dice: ' + messageContext['comments']);   
        }
        catch(ex){
            console.log('Error[socket][replyMessageForAgent]: ' + ex);
        }
    }

    public replyMessageForClient(agentSocket:String,messageString:String){
        try{  
            console.log('Iniciando envío de mensaje desde el agente ' + agentSocket +' a cliente.');
            new MessengerController().standardizeOutcommingMessage(agentSocket,messageString);
        }
        catch(ex){
            console.log('Error[socket][replyMessageForClient]: ' + ex);
        }
    }
}