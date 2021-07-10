import { CatRols } from './../models/rol';
import { NextFunction, request, Request, response, Response } from "express";
import jwt from "jsonwebtoken";

import { Connection, getRepository, Repository } from "typeorm";
import { CatUsers } from "../models/user";

import { Resolver } from '../services/resolver';
import { Utils } from "../services/utils";
import { Message } from 'twilio/lib/twiml/MessagingResponse';
import { userInfo } from 'os';

export class AuthController {

    
    public async signIn(req:Request, res:Response): Promise<void> {
         try { 
             console.log('Agente intentando hacer login: ');
             console.log(req.body);
             const user = await getRepository(CatUsers) 
                 .createQueryBuilder("user") 
                 //.leftJoinAndSelect("user.chat", "chat")
                 //.leftJoinAndSelect("user.call", "call")
                 .leftJoinAndSelect("user.rol", "rol") 
                 .leftJoinAndSelect("rol.permission", "permission") 
                 .leftJoinAndSelect("permission.menu", 'menu')
                 .leftJoinAndSelect("user.status", 'status')
                 .leftJoinAndSelect("user.credentials", 'credentials')
                 .where("user.email = :email", {email: req.body.email}) 
                 .andWhere("user.password = :password", {password: await new Utils().encrypt(req.body.password)}) 
                 .getOne();

             let payload = {
                 user: user 
             };
            
             if(user) {
                 payload['token'] = jwt.sign(payload, process.env.JWT_KEY, { expiresIn: 60 * 60 });
                 new Resolver().success(res, 'User authorized', payload);
                 //Una vez que se logró consultar la info del usuario, consultamos la info de su rol

                 //payload['']
             }
         else new Resolver().error(res, 'Invalid credentials.');
         }
         catch(ex) {
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
}