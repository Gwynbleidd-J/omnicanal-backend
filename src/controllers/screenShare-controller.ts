import { Request, Response } from "express";
import sharp from 'sharp';
import fs from 'fs';
import { Resolver } from '../services/resolver';
import { SocketIO } from '../services/socketIO';
import express from 'express';
import path from "path";

export class ScreenShareController{

    public async ScreenShotFromClient(req:Request, res:Response):Promise <void>{
        try{

            res.status(200).json({
                status: 'success',
                file: req.file,
                message: 'image uploades successfully'
            });
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
        res.sendFile(path.join(__dirname, '../screen/uploads/0_capture.png-1638810605029.png'));
        
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