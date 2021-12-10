import { Request, Response } from "express";
import sharp from 'sharp';
import fs from 'fs';
import { Resolver } from '../services/resolver';
import { SocketIO } from '../services/socketIO';
import express from 'express';
import path from "path";
import { getRepository } from "typeorm";
import { CatUsers } from "../models/user";
import { Console } from "console";

export class ScreenShareController{

    public BarridoSockets(idSocket, objetoEnvio){

        try {
            let sentNotification = 0;
            let copiaGlobalArraySockets = global.globalArraySockets;
            copiaGlobalArraySockets.forEach(element => {
                console.log("Comprobando "+element.remotePort+ " y "+ idSocket)
                if (element.remotePort == idSocket && sentNotification < 1) {
                    console.log("Enviando notificacion a "+idSocket);
                    let notificationString = JSON.stringify(objetoEnvio);
                    console.log("Data enviada al socket:" +notificationString);
                    element.write(notificationString);
                    sentNotification ++
                }
            });
        } catch (error) {
            console.log("Ha ocurrido un error inesperado:" +error);
        }
    }

    public async startMonitoring(req: Request, res: Response){
        try {

            console.log("\nIniciando monitoreo, mandando orden al agente");
            let idAgente = req.body.idAgente;
            let idSupervisor = req.body.idSupervisor;

            let agente = await getRepository(CatUsers)
            .createQueryBuilder("user")
            .where("user.ID = :id",{ id: idAgente })
            .getOne();

            let objeto = {
                startMonitoring: "",
                idSupervisor: idSupervisor
            }

            console.log("\nSe le mandara la orden al agente "+agente.name +" con el id "+agente.activeIp);
            new ScreenShareController().BarridoSockets(agente.activeIp, objeto);
            // this.BarridoSockets(agente.activeIp, objeto);

            new Resolver().success(res, "Se envio la orden al agente de comartir su pantalla correctamente");

        } catch (error) {
            new Resolver().exception(res, "No se pudo enviar la orden al agente de compartirsu pantalla correctamente", error);
        }
    }

    public async ScreenShotFromClient(req:Request, res:Response):Promise <void>{
        try{

            res.status(200).json({
                status: 'success',
                file: req.files,
                text: req.body,
                message: 'image uploades successfully'
            });

            let directory = "../screen/uploads/";
            let temp = req.files["campo2"][0].filename;
            let file = directory + temp;

            let idSupervisor = req.files["campo2"][0].originalname;
            let Supervisor = await getRepository(CatUsers)
            .createQueryBuilder("supervisor")
            .where("supervisor.ID = :idSupervisor",{ idSupervisor: idSupervisor})
            .getOne();

            let ipSupervisor = Supervisor.activeIp;

            let objeto = {
                getMonitoring : "",
                Image: req.files["campo1"][0].filename
            }

            new ScreenShareController().BarridoSockets(ipSupervisor, objeto);
            fs.unlinkSync(path.join(__dirname, file));
            // this.BarridoSockets(ipSupervisor, objeto);

            // console.log(req.file);
            //<!-- USANDO LA LIBRERÍA SHARP PARA EL PROCESAMIENTO DE IMAGEN -->
            // const images = req.file
            // const procesedImage = sharp(images.buffer);
            // const resizedImage = procesedImage.resize(1900, 1080,{
            //     fit: "contain",
            //     background: {r: 255, g:255, b:255, alpha: 0}
            // });
            // const resizedImageBuffer = await resizedImage.toBuffer()
            // console.log(procesedImage);
            
            // fs.writeFileSync('nuevaRuta/prueba.png', resizedImageBuffer);
            // res.send({
            //     resize: resizedImageBuffer
            // })

        }catch(error){
           res.json({
               error
           })
            // new Resolver().exception(res, 'Unexpected error. ', error);
        }
    }

    public SendDataToHTML(req:Request, res:Response):void{

        try {
            let imageName = req.body.image;
            let directory = "../screen/uploads/";
            let file = directory + imageName;
    
            // res.sendFile(path.join(__dirname, file));
            res.sendFile(path.join(__dirname, file), function(err){
                if (err) {
                    
                }else{
                    console.log("\nSe ha enviado la imagen al supervisor correctamente");
                    fs.unlinkSync(path.join(__dirname, file));
                }
            });
    
        } catch (error) {
            console.log("Ha ocurrido un error en el envio de imagen al supervisor:" +error);
        }


        // res.sendFile(path.join(__dirname, '../screen/uploads/KODE-OP-Wallpaper_Art_Black_1920x1080.png-1638817341401.png'));
        
        // const files = fs.readdir('./src/screen/uploads/', (error, files) =>{
        //     if(error){
        //         console.log(error);
        //     }

        //     console.log(files);  
        // })
        // console.log(files);
        // // console.log(__dirname, '../screen/uploads');
        // res.sendStatus(200);
    }
}