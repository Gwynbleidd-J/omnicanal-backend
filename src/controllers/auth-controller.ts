import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import { getRepository } from "typeorm";
import { CatUsers } from "../models/user";

import { Resolver } from "../services/resolver";
import { Utils } from "../services/utils";

export class AuthController {
    public async signIn(req:Request, res:Response): Promise<void> {
        try { 
            console.log(req.body.email);
            const user = await getRepository(CatUsers)
                .createQueryBuilder("user")
                .where("user.email = :email", {email: req.body.email})
                .andWhere("user.password = :password", {password: await new Utils().encrypt(req.body.password)})
                .getOne();

            let payload = {
                username: user.name,                
                email: user.email            
                // password: user.password
            };
            
            if(user) {
                payload['token'] = jwt.sign(payload, process.env.JWT_KEY, { expiresIn: 60 * 60 });
                new Resolver().success(res, 'User authorized', payload);
                // new Whatsapp().sendWelcomeMessage( user.name + ', iniciaste sesión en la plataforma omnicanal, si no has sido tú. Reporta a soporte', 'whatsapp:+5214625950962');
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