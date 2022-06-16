import { Telegraf } from 'telegraf';
import { MessengerController } from './../controllers/messenger-controller';
// import { WhatsappController } from './../controllers/whatsapp-controller';
import { Router } from "express";
import { Socket } from 'socket.io';
import multer from 'multer';
import path from 'path';

export class MessengerRouting{
    public router: Router;
    private messengerController: MessengerController;
    constructor(telegraf:Telegraf) {
        this.router = Router();
        this.messengerController = new MessengerController();
        this.routes();
    }
    private routes(): void {
       //*PARA QUE LAS IMAGENES SE GUARDEN EN UNA CARPETA DENTRO DE API
        //const imageStorage = multer.memoryStorage();
        const imageStorage = multer.diskStorage({
            destination: path.join(__dirname, '../public/img'),
            filename:(req, file,cb) =>{
                const ext = file.mimetype.split("/")[1];
                cb(null, `${file.originalname}-${Date.now()}.${ext}`);
            }
        });
        const upload = multer({
            //* LA LINEA COMENTADA ES PARA SUBIR CON DISKSTORAGE
            dest: path.join(__dirname, '../public/img'),
           storage: imageStorage,
           
        })
        
        this.router.post('/whatsapp', this.messengerController.whatsappIncommingMessage);
        //this.router.post('/chatweb', this.messengerController.chatWebIncommingMessage);
        //this.router.get('/message', this.messengerController.outcommingWebMessage);
        //Implementar métodos para poder recuperar el último mensaje o en su caso, el histórico de todos los msjs
        this.router.post('/recoverActiveChats', this.messengerController.recoverActiveChats);
        this.router.post('/', this.messengerController.getMessages);
        this.router.post('/outMessage', this.messengerController.outcommingMessage);
        //this.router.get('/message', this.messengerController.sendOutcommingMessage);
        this.router.post('/newEmptyChat', this.messengerController.createEmptyChat);
        this.router.post('/sendImage', upload.any(), this.messengerController.ImageFromApp);
        // this.router.post('/sendImage',upload.single('image'), this.messengerController.ImageFromApp);
        // this.router.post('/sendImage', upload.fields([{ name: 'campo1'}, {name: 'campo2'}, {name: 'campo3'},{ name: 'campo4'}, {name: 'campo5'}, {name: 'campo6'}]) ,this.messengerController.ImageFromApp);
    }
}

//http://localhost/api/messages/
/*
funcion para crear el objeto con las propiedades
function Persona(nombre, edad){
    this.nombre = nombre;
    this.edad = edad;
}
se manda llamar la funcion dentro de new Persona

ahora se guarda los objetos que se crean en un array de objetos
simplemente se crea un array vacio.
arrayObject = []
despues se le hace un push al array para guardar el objeto en el array.
 */