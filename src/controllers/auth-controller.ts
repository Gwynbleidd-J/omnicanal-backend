import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import { getRepository } from "typeorm";
import { CatUsers } from "../models/user";

import { Resolver } from "../services/resolver";
import { Utils } from "../services/utils";

export class AuthController {

    public async signIn(req:Request, res:Response): Promise<void> {
        try { 
            console.log('Agente intentando hacer login: ');
            console.log(req.body);
            const user = await getRepository(CatUsers)
                .createQueryBuilder("user") 
                .where("user.email = :email", {email: req.body.email}) 
                .andWhere("user.password = :password", {password: await new Utils().encrypt(req.body.password)}) 
                .getOne();

            let payload = {
                ID: user.ID,
                username: user.name,                
                email: user.email,        
                rolId: user.rolID  
            };
            
            if(user) {
                payload['token'] = jwt.sign(payload, process.env.JWT_KEY, { expiresIn: 60 * 60 });
                new Resolver().success(res, 'User authorized', payload);
                //Una vez que se logró consultar la info del usuario, consultamos la info de su rol

            }
            else new Resolver().error(res, 'Invalid credentials.');
        }
        catch(ex) {
            new Resolver().exception(res, 'Unexpected error.', ex);
        }
    }


    // public async signIn(req:Request, res:Response): Promise<void> {
    //     try { 
    //         console.log('Agente intentando hacer login: ');
    //         console.log(req.body);
    //         const user = await getRepository(CatUsers)
    //             .createQueryBuilder("user") 
    //             .leftJoinAndSelect("user.rolID", "rolID")
    //             .where("user.email = :email", {email: req.body.email}) 
    //             .andWhere("user.password = :password", {password: await new Utils().encrypt(req.body.password)}) 
    //             .getMany();

    //         let payload = {
    //             username: user.name,                
    //             email: user.email,        
    //             rolId: user.rolID 
    //             , rol
    //         };
            
    //         if(user) {
    //             payload['token'] = jwt.sign(payload, process.env.JWT_KEY, { expiresIn: 60 * 60 });
    //             new Resolver().success(res, 'User authorized', payload);
    //             //Una vez que se logró consultar la info del usuario, consultamos la info de su rol

    //         }
    //         else new Resolver().error(res, 'Invalid credentials.');
    //     }
    //     catch(ex) {
    //         new Resolver().exception(res, 'Unexpected error.', ex);
    //     }
    // }

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