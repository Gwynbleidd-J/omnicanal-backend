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

    public initSocketServer(): void { /*  */

        this.netServer = net.createServer(socket => {
            this.arraySockets.push(socket);
            global.globalArraySockets.push(socket); 
            
            this.netServer.on('close', ()=>{
                console.log('Server closed!');
            });
        });
        
        this.netServer.on('connection', (socket)=>{
            //Intentando escribir en la variable global;
            this.netServer.getConnections((error, count)=>{
                console.log(`Active clients ${count}`);
                console.log(socket.remoteAddress + ' is now connected');
            });       

            socket.setEncoding('utf-8');

            socket.setTimeout(800000, ()=>{
                console.log('Socket time out');
            });

            // socket.write('Bienvenido, este es el ejemplo de las notificaciones que enviaremos: ');
            // socket.write('{"chatId": 158, "platformIdentifier": "w"}');
            socket.on("data", data =>  {          
                console.log(socket.remoteAddress + ' dice: ' + data.toString()); // prints the data  
                socket.write('\n Alguien dice: ' + data.toString());                  
                this.replyMessageForClient(socket.remoteAddress, data.toString());  
            });
            
            socket.on('drain', ()=>{
                console.log('write buffer is now empty');
            });

            socket.on('error', (error)=>{
                console.log(`Error: ${error}`);
            });
            
            socket.on('timeout', ()=>{
                console.log('Socket timed out');
                socket.end('timed out');
            });

            socket.on('end', (data)=>{ 
                console.log('Socket disconnected');
                console.log(`End data: ${data}`); 
            });


            socket.on('close',function(error){
                console.log('Socket closed!');
                if(error){
                    console.log('Socket was closed because a due of transmission error');
                }
            });

            setTimeout(() => {
                var isDestroyed = socket.destroyed;
                console.log(`Socket destroyed ${isDestroyed}`);
                socket.destroy();
            },1200000);
        }); 

        this.netServer.on('listening', ()=>{
            console.log('Net Socket Server is listening');
        });

        this.netServer.listen(8000);

        var isListening = this.netServer.listening;
        if(isListening){
            console.log('Server is listening');
        }
        else{
            console.log('Server is not listening');
        }

        setTimeout(()=>{
            this.netServer.close();
        }, 5000000);
    }

/*     public initSocketServer(): void { 
        this.netServer = net.createServer(socket => {
            this.arraySockets.push(socket);
            global.globalArraySockets.push(socket); 


            //Intentando escribir en la variable global;        
            console.log(socket.remoteAddress + ' is now connected');

            // socket.write('Bienvenido, este es el ejemplo de las notificaciones que enviaremos: ');
            // socket.write('{"chatId": 158, "platformIdentifier": "w"}');

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
    } */

    public replyMessageForAgent(messageContext:JSON, agentSocket:net.Socket): void{
        try{ 
            let notificationString = '{"chatId": "'+messageContext['id']+'", "platformIdentifier": "'+messageContext['platformIdentifier']+'", "clientPlatformIdentifier": "'+messageContext['clientPlatformIdentifier']+'"}'; 
            console.log('Cuerpo original de la notificación: ' + notificationString); 
            agentSocket.write(notificationString);   
            console.log('Notificación enviada a ' +  messageContext['agentPlatformIdentifier']);  
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