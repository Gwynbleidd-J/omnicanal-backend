import {MessengerController} from './../controllers/messenger-controller';

export class SocketIO{
    //METODO COMENTADO EL CUAL EMULA EL EVENTO DISCONNECT DE SOCKET.IO
    /* public IOEventDisconnect(event:string, type?:any){
        type.on(event, () =>{
            console.log(`A client has disconnect: ${type.handshake.address}:${type.id}`);
            global.socketIOArraySockets.pop(type.id);
            //console.log(`Array: ${global.socketIOArraySockets}`);
        });
    } */

    public IOEventOn(event:string, type?:any, data?:any){
        type.on(event, (data)=>{
            console.log(data);
            new MessengerController().standardizeIncommingMessage(data, 'c');
        })
    }
      
    public IOEventEmit(event:string, type?:any,data?:any){
        type.emit(event, data);
        console.log(data);
    }
}