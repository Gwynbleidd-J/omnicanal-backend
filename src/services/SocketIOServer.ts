import {MessengerController} from './../controllers/messenger-controller';
import * as socketio from 'socket.io';
 
export class SoscketIOServer{
    //  //METODO COMENTADO EL CUAL EMULA EL EVENTO DISCONNECT DE SOCKET.IO

    public socketHandler: socketio.Server;
    constructor(handler?: socketio.Server){
        this.socketHandler = handler;
        this.methods();
    }

    private methods():void{
        this.socketHandler.on('connection', socket =>{
            console.log(`New Conntection on server :v: ${socket.handshake.address}:${socket.id}`);
            global.socketIOArraySockets.push(socket.id);

            //this.replyMessage(socket);

            socket.on('disconnect', () => {
                console.log(`A socket has been disconnected: ${socket.handshake.address}:${socket.id}`);
                global.socketIOArraySockets.pop(socket.id);
            });
        });
    }
    
    // public replyMessage(socket:any, data?:any){
    //     console.log(`entró a [replyMessageForAgent]`);
    //     this.socketHandler.to(socket).emit('message', data);
    // }

    // private listen(){
    //     this.socketHandler.on(SocketEvent.CONNECT, (socket:any) => {
    //         console.log("New player connected!");

    //         socket.on(SocketEvent.DISCONNECT, (socket:any) => {
    //             console.log("Player disconnected!");
    //         });

    //         socket.on(SocketEvent.SAY_HI, (data: any) => {
    //             console.log("player says: " + data.msg);
                

    //             this.socketHandler.sockets.emit(SocketEvent.SAY_HI, data);
    //             //socket.broadcast.emit(SocketEvent.SAY_HI, data.msg);
    //         });
    //     });
    // }


    /* Eventos antiguos
        // public IOEventDisconnect(event:string, type?:any){
    //     type.on(event, () =>{
    //         console.log(`A client has disconnect: ${type.handshake.address}:${type.id}`);
    //         global.socketIOArraySockets.pop(type.id);
    //         //console.log(`Array: ${global.socketIOArraySockets}`);
    //     });
    // }
    
    // public IOEventOn(event:string, type?:any, data?:any){
    //     type.on(event, (data)=>{
    //         console.log(data);
    //         new MessengerController().standardizeIncommingMessage(data, 'c');
    //     })
    // }
      
    // public IOEventEmit(event:string, type?:any,data?:any){
    //     type.emit(event, data);
    //     console.log(data);
    // }

    // public IOEventTo(event:string, type?:any,data?:any, socketid:?any, event2?:any){
    //     type.to(socketid)
    // }
    */
    
    /*Para hacer la clase con constructor
    // private socketHandler: socketio.Server;
    // constructor(handler: socketio.Server){
    //     this.socketHandler = handler;
    //     this.listen();
    // }

    // private listen(){
    //     this.socketHandler.on('connection', socket =>{
    //         console.log(`New Connection: ${socket.handshake.address}:${socket.id}`);
    //     });

    //     this.socketHandler.on('disconnect', socket =>{
    //         console.log(`A client has disconnect: ${socket.handshake.address}:${socket.id}`);
    //     })
    // }
    */
    
}