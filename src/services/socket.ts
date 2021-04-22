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
            
            this.netServer.getConnections((error, count) => {
                console.log('Active clients: ' + count);
            });

            socket.write('Bienvenido ');

            socket.on("data", data =>  {          
                console.log(socket.remoteAddress + ' dice: ' + data.toString()); // prints the data  
                socket.write('\n Alguien dice: ' + data.toString());                  
                this.replyMessageForClient(socket.remoteAddress, data.toString());
                // ////    Prueba para replicar el mensaje entrante a cada agente 
                // this.arraySockets.forEach(element => { 
                //     element.write('\n Disculpa ' + element.remoteAddress + ', '+ socket.remoteAddress +' dice: ' + data.toString()); 
                // });

            });

            socket.on('end', ()=>{ 
                console.log('DISCONNECTED: '); 
            }); 
        }); 

        this.netServer.listen(8000); 
    }

    public replyMessageForAgent(messageContext:JSON, agentSocket:net.Socket): void{
        try{
            console.log('Esperando a enviar a ' +  messageContext['agentPlatformIdentifier']); 
            agentSocket.write('\n  ' +messageContext['clientName']+' ['+ messageContext['clientPlatformIdentifier'] +'] dice: ' + messageContext['comments']);   
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