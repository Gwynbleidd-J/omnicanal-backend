import * as net from 'net';

export class Socket {
    private mensajeBienvenida:String;
    private netServer:net.Server;
    public arraySockets:any;

    constructor(){
        this.initSocketServer();
        console.log('constructor iniciado');
        this.arraySockets = [];
    }

    public initSocketServer(): void {
        console.log('initSocketServer iniciado...');
        this.netServer = net.createServer(socket => {
            this.arraySockets.push(socket);
            console.log(socket.remoteAddress + ' is now connected');
            
            this.netServer.getConnections((error, count) => {
                console.log('Active clients: ' + count);
            });

            socket.write('Bienvenido ');

            socket.on("data", data =>  {          
                console.log(socket.remoteAddress + ' dice: ' + data.toString()); // prints the data  
                socket.write('\n Alguien dice: ' + data.toString());  
                
                ////    Prueba para replicar el mensaje entrante a cada agente 
                this.arraySockets.forEach(element => {
                    // console.log(element);
                    element.write('\n Disculpa ' + element.remoteAddress + ', '+ socket.remoteAddress +' dice: ' + data.toString()); 
                });
                 
            //  new Telegram().sendMessages('Agente dice: ' + data.toString(), '1743337519');         
            });

            socket.on('end', ()=>{ 
                console.log('DISCONNECTED: '); 
            }); 
        });

        this.netServer.listen(8000);
    }
}