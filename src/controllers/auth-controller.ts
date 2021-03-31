import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import { getRepository } from "typeorm";
import { User } from "../models/user";

import { Resolver } from "../services/resolver";

export class AuthController {
    public async signIn(req:Request, res:Response): Promise<void> {
        try {
            const user = await getRepository(User)
                .createQueryBuilder("user")
                .where("user.userName = :userName", {userName: req.body.userName})
                .andWhere("user.email = :email", {email: req.body.email})
                .getOne();

            let payload = {
                username: user.userName,
                email: user.email
            };
            
            if(user) {
                payload['token'] = jwt.sign(payload, process.env.JWT_KEY, { expiresIn: 60 * 60 });
                new Resolver().success(res, 'User authorized', payload);
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