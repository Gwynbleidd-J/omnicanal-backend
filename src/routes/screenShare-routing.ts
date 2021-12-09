import { Router} from 'express';
import { ScreenShareController } from '../controllers/screenShare-controller';
import multer from 'multer';
import path from 'path';

export class ScreenShareRouting{
    public router:Router;
    private screenController:ScreenShareController;
    
    constructor(){
        this.router = Router();
        this.screenController = new ScreenShareController();
        this.routes();
    }
    private routes(): void{

        //MULTER´S CONFIGURATION
        // const imageStorage = multer.diskStorage({
        //     destination: path.join(__dirname, '../screen/uploads'),
        //     filename: (req, file, cb) =>{
        //         const ext = file.mimetype.split("/")[1];
        //         cb(null, `${file.originalname}-${Date.now()}.${ext}`);
        //     }
        // });
        const imageStorage = multer.diskStorage({
            destination: path.join(__dirname, '../screen/uploads'),
            filename:(req, file,cb) =>{
                const ext = file.mimetype.split("/")[1];
                cb(null, `${file.originalname}-${Date.now()}.${ext}`);
            }
        });
        const upload = multer({
            dest: path.join(__dirname, 'screen/uploads'),
            storage: imageStorage
        })

        this.router.post('/', upload.fields([{ name: 'campo1'}, {name: 'campo2'}]) ,this.screenController.ScreenShotFromClient);
        this.router.post('/screen', this.screenController.SendDataToHTML);
        this.router.post('/startMonitoring', this.screenController.startMonitoring);
        //upload.array('image')
    }
    // this.app.use(multer({
    //     dest: path.join(__dirname, 'screen/uploads')
    // }).single('image'));
}


/*
const multer  = require('multer')
const upload = multer({ dest: 'uploads/' }) 
*/