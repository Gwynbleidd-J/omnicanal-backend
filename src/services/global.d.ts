import { Socket } from './socket';
import * as net from 'net'; 
//declare var _INITIAL_DATA_: initialData;


// type initialData = {
//     userID: string;
//     serverData?: string[];  
// };



// interface Window{
//     _INITIAL_DATA_: initialData
// }


//declare let globalArraySockets: net.Socket[];
// declare let globalArraySockets:any;
// declare var cadenaGlobal: string;

declare global{
    var cadenaGlobal: string;
    var globalArraySockets:any;
}