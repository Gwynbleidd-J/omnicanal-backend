
import { Request, Response } from "express";

import { getRepository } from "typeorm";
import { CatUsers } from "../models/user";

import { Resolver } from "../services/resolver";
import { Utils } from "../services/utils";


export class UserController {
    public async register(req:Request, res:Response): Promise<void> {
        try { 
            req.body.password = await new Utils().encrypt(req.body.password);
            getRepository(CatUsers).save(req.body)
                .then(result => new Resolver().success(res, 'Register succesfull', result))
                .catch(error => new Resolver().error(res, 'Register error', error));
        }
        catch(ex) {
            new Resolver().exception(res, 'Unexpected error.', ex);
        }
    }
  
}