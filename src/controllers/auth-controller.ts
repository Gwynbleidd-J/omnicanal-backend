import { CatRols } from './../models/rol';
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import { Connection, getRepository, Repository } from "typeorm";
import  {CatUsers}  from "../models/user";

import { Resolver } from '../services/resolver';
import { Utils } from "../services/utils";
import { Message } from 'twilio/lib/twiml/MessagingResponse';
import { userInfo } from 'os';
import { MessengerController } from './messenger-controller';
import { Logger } from '../services/logger';
import express from 'express';

var CrytpoJs =require("crypto-js");

export class AuthController {
    public async signIn(req:Request, res:Response): Promise<void> {
        let logger:Logger = new Logger('auth');
        try { 
            //console.log('Agente intentando hacer login: ');
            //console.log(req.body);
            
            //Prueba de desencriptacion
            var encryptedPass = req.body.password;
            var encryptedEmail = req.body.email;
            //console.log("Contraseña recibida:" +encryptedPass);
            //console.log("Correo recibido:" +encryptedEmail);
            
            let clearPassword = CrytpoJs.enc.Utf8.stringify(CrytpoJs.AES.decrypt(encryptedPass, "PasswordPromoEsp"))
            let clearEmail = CrytpoJs.enc.Utf8.stringify(CrytpoJs.AES.decrypt(encryptedEmail, "PasswordPromoEsp"))
            
            const user = await getRepository(CatUsers) 
            .createQueryBuilder("user") 
            //.leftJoinAndSelect("user.chat", "chat")
            //.leftJoinAndSelect("user.call", "call")
            .leftJoinAndSelect("user.rol", "rol") 
            .leftJoinAndSelect("rol.permission", "permission") 
            .leftJoinAndSelect("permission.menu", 'menu')
            .leftJoinAndSelect("user.status", 'status')
            .leftJoinAndSelect("user.credentials", 'credentials')
            .where("user.email = :email", {email: clearEmail}) 
            .andWhere("user.password = :password", {password: await new Utils().encrypt(clearPassword)}) 
            .getOne();

            let payload = {
                user: user 
            };
            if(user) {
                console.log('user logged in',user.activo)
                if(user.activo === 0){
                    payload['token'] = jwt.sign(payload, process.env.JWT_KEY, { expiresIn: 60 * 60 });
                    //new MessengerController().ReAsignQueuedChat();
                    logger.info('Usuario:' +user.name +' , '+'Con ID:'+ user.ID + '- Usuario autorizado');
                    new Resolver().success(res, 'User authorized', payload);
                    //Una vez que se logró consultar la info del usuario, consultamos la info de su rol
                    //payload['']
                }
                else{
                    console.log('el usuario ya está logueado');
                    new Resolver().forbidden(res, 'user loggen in');
                }

            }
            else{
                logger.error('Ivalid credentials');
                new Resolver().error(res, 'Invalid credentials.');
            } 
        }
        catch(ex) {
            logger.error('Exepcion no controlada - ' + JSON.stringify(ex));
            new Resolver().exception(res, 'Unexpected error.', ex);
        }
    }
    
    public async authenticate(req:Request, res:Response, next:NextFunction): Promise<void> {
        let token = req.headers['authorization'];
        token = token?.replace('Bearer', '').trim();
        if(token) jwt.verify(token, process.env.JWT_KEY, (err, data) => {
            if(err) new Resolver().error(res, 'Unahutorized token.');
            else next();
        });
        else new Resolver().error(res, 'Token not found in headers.');
    }

    public async checkUserLoggegIn(req:Request, res:Response):Promise<void>{
        try{
            var encryptedEmail = req.body.email;

            let clearEmail = CrytpoJs.enc.Utf8.stringify(CrytpoJs.AES.decrypt(encryptedEmail, "PasswordPromoEsp"))
            let user = await getRepository(CatUsers)
            .createQueryBuilder()
            .update(CatUsers)
            .set({ activo:1 })
            .where("email = :email", {email: clearEmail})
            .execute()

            if(user.affected === 1){
                console.log('La columna activo se modifico correctamente a valor 1')
                new Resolver().success(res, 'activo column has change correctly');
            }
        }catch(ex){
            console.log('Error:[UpdateActiveColumn]', ex);
            new Resolver().error(res, 'Error:[UpdateActiveColumn]')
        }
    }
}