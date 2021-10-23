import { MessengerController } from './../controllers/messenger-controller';
import * as net from 'net';
import * as globalArraySockets from './global';
import { SocketIO } from './socketIO';
import { UserController } from '../controllers/user-controller';

export class Socket {
    private mensajeBienvenida:String;
    public netServer:net.Server;
    public sockets:any;
    public port:Number;
    public clientAddress:any;

    constructor(){
        // this.initSocketServer();
        console.log('constructor iniciado');
        this.sockets = [];    
        global.globalArraySockets = this.sockets;
    }

    public initSocketServer(): void{
        this.port = 8000;
        let clientAddress:any;
        this.netServer = net.createServer();
        
        
        /*Checar cual metodo para crear un array de sockets es el mejor el que se 
        creo en el codigo comentado o el que actualmente se está utilizando en la
        clase*/
        
        //this.netServer = net.createServer(socket =>{
        //this.sockets.push(socket);
        //global.globalArraySockets.push(socket);      
        //})

        this.netServer.listen(this.port,() =>{
            console.log(`TCP server is running on port: ${this.port}`);
        });

        this.netServer.on('connection', socket =>{
            this.clientAddress = `${socket.remoteAddress}: ${socket.remotePort}`;
            console.log(`client connected: ${this.clientAddress}`);
            global.globalArraySockets.push(socket);

            this.netServer.getConnections((error, count)=>{
                if(error){
                    console.log(`${error}`)
                }
                console.log(`Active Clients ${count}`)
            });

             socket.on('data', (data) =>{
                let sentNotification = 0; 
                //TODO:Borrar luego
                console.log("Entrando a al recibimiento de data en el server")
                try {
                    console.log("Asi se ve la data recibida: " +data);
                    let rawData = data.toString();
                    let clearData = JSON.parse(rawData);
                    if (clearData.hasOwnProperty('platformIdentifier')) {
                        console.log("Si tiene la identificacion de plataforma!");
                        if (clearData.platformIdentifier == 'c' && clearData.transmitter == 'c') {
                            console.log("Y si viene desde un chat web!");
                            try{   
                                MessengerController.prototype.standardizeIncommingMessage(clearData,'c');
                            }
                            catch(ex){
                                console.log('Error[incommingWebMessage]:' + ex);
                            }
                        }
                        else if(clearData.platformIdentifier == 'c' && clearData.transmitter == 'a'){
                            console.log("Mensaje hacia el chat web");
                            try{
                                global.globalArraySockets.forEach(element => {
                                    if((element.remoteAddress == '::ffff:'+clearData['clientPlatformIdentifier']) && (sentNotification < 1)){
                                        console.log('Direccionando mensaje al socket ' + element.remoteAddress);
                                        this.replyMessageForAgent(clearData, element);
                                        sentNotification++
                                    }
                                });
                                //socket.write(data);
                            }
                            catch(ex){
                                console.log(`Error  al mandar mensaje al cliente Web ${ex}`)
                            }
                        }
                    }
                } catch (error) {
                    console.log("La data recibida en el socket no pudo ser convertida a json: "+error);
                }
                
            });

            socket.on('close', async ()=>{
                let index = global.globalArraySockets.findIndex((o) =>{
                    return o.remoteAddress === socket.remoteAddress && o.remotePort === socket.remotePort;
                });
                if(index !== 1){
                    global.globalArraySockets.splice(index, 1);
                }
                global.globalArraySockets.forEach((sock)=>{
                    sock.write(`${this.clientAddress} disconnected`)
                });
                console.log(`connection closed: ${this.clientAddress}`);
                let activeIP = this.clientAddress.substring(7,20);
                console.log("Su direccion es:" +activeIP);
                let agent = new UserController().getAgentByIP(activeIP);
                new MessengerController().NotificateLeader("FS", (await agent).ID , null, null);
            });
            socket.on('error', err=>{
                
                console.log(`Error occurred in ${this.clientAddress}: ${err.message}`);
            });
        });

        this.netServer.on('close', ()=>{
            console.log('Server closed!');
        });
    }

    public replyMessageForAgent(messageContext:JSON, agentSocket:net.Socket): void{
        try{
            //OUTCOMMING
            if(messageContext['platformIdentifier'] == 'c' && messageContext['transmitter'] == 'a' ){
                let notificationString = '{"agentPlatformIdentifier": "'+messageContext['agentPlatformIdentifier']+'", "text": "'+messageContext['text']+'", "platformIdentifier": "'+messageContext['platformIdentifier']+'", "transmitter": "'+messageContext['transmitter']+'"}';
                console.log('Cuerpo original de la notificación: ' + notificationString); 
                //agentSocket.write(notificationString);
                new SocketIO().IOEventEmit('server-message', notificationString);
                console.log('Notificación enviada a ' +  messageContext['clientPlatformIdentifier']);   
            }
            else{
                let notificationString = '{"chatId": "'+messageContext['id']+'", "platformIdentifier": "'+messageContext['platformIdentifier']+'", "clientPlatformIdentifier": "'+messageContext['clientPlatformIdentifier']+'"}'; //, "numberToSend": "'+messageContext['NumberToSend']+'", "notificacionType": "'+messageContext['notificationType']+'"
                console.log('Cuerpo original de la notificación: ' + notificationString); 
                agentSocket.write(notificationString);

                /////------Linea de codigo para mandar un mesaje cuando se cierre una página-----//////
                console.log('Notificación enviada a ' +  messageContext['agentPlatformIdentifier']);
            }
  
        }
        catch(ex){
            console.log('Error[socket][replyMessageForAgent]: ' + ex);
        }
    }

    public replyMessageForClient(agentSocket:String,messageString:String){
        try{  
            console.log('replyMessageForClient: Iniciando envío de mensaje desde el agente ' + agentSocket +' a cliente.');
            new MessengerController().standardizeOutcommingMessage(agentSocket,messageString);
        }
        catch(ex){
            console.log('Error[socket][replyMessageForClient]: ' + ex);
        }
    }
}

/* this.netServer.on('connection', (socket) =>{
            console.log(`Client Connected, Remote Address:${socket.remoteAddress} Remote Port:${socket.remotePort}`);
            //this.sockets.push(socket); se comenta para meter el del globla.globalsockets
            global.globalArraySockets.push(socket);
            
            this.netServer.getConnections((error, count)=>{
                if(error){
                    console.log(`${error}`)
                }
                console.log(`Active Clients ${count}`)
            });

            socket.on('data', data =>  {
                console.log(`Data ${socket.remoteAddress}: ${data}`);
                console.log(socket.remoteAddress + ' dice: ' + data.toString()); // prints the data  
                socket.write('\n Alguien dice: ' + data.toString());                  
                this.replyMessageForClient(socket.remoteAddress, data.toString());
            });

            socket.on('end', (data)=>{
                console.log('Closing connection with the client');
            });

            socket.on('end',(data)=>{
                let index = this.sockets.findIndex((o)=>{
                    return o.remoteAddress === socket.remoteAddress && o.remotePort === socket.remotePort;
                });
                //console.log(index);
                if(index !==1)
                this.sockets.splice(index, 1)
                console.log(`Closed: Remote Address:${socket.remoteAddress} Remote Port:${socket.remotePort}`);
                socket.destroy();
            });
            
            socket.on('error',(error)=>{
                console.log(`${error}`);
            })
        }); 

        this.netServer.on('close', ()=>{
            console.log('Server closed!');
        });*/

/* Se comenta el codigo anterior para la creacion y manipulacion de sockets
      debido a que en está versión del codigo el se cerraba correctamente el socket 
      que se creaba para la comunicacion con el usuario.  
      public initSocketServer(): void {

        this.netServer = net.createServer(socket => {
            this.arraySockets.push(socket);
            global.globalArraySockets.push(socket);
        });

       this.netServer.on('close', ()=>{
            console.log('Server closed!');

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
                console.log(`${error}`);
            });
            
            socket.on('timeout', ()=>{
                console.log('Socket timed out');
                socket.end('timed out');
                socket.destroy();
                
            });
             *El Problema es que el socket se desconecta del cliente
             *Pero no se desconecta del servidor
             *El error que arroja es Error: Error: This socket has been ended by the other party
             
            socket.on('end', (data)=>{ 
                console.log('Socket disconnected');
                console.log(`End data: ${data}`);
                
            });

            socket.on('close',function(error){
                console.log('Socket closed!');
                if(error){
                    console.log('Socket was closed because a due of transmission error');
                }
                //console.log('Se removieron todos los eyentes del socket');
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
    } */
