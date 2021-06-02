import { CatRols } from './../models/rol';
import { NextFunction, Request, Response } from "express"; 

import { Connection, getRepository, Repository } from "typeorm";  
import { Resolver } from "../services/resolver";
import { Utils } from "../services/utils";

export class RolController {
    public async getRols(req:Request, res:Response): Promise<void>{
        try{
            console.log('Consultando roles'),
            console.log(req.body.id);

            const rol = await getRepository(CatRols)
            .createQueryBuilder("rol")
            .leftJoinAndSelect("rol.permission", "permission")
            .getMany();
            // const rol = await rolRepo.find({ relations: ["user"] });

            // const rol = await getRepository(CatRols)
            // .createQueryBuilder("rol")
            // .leftJoinAndSelect("rol.user", "user")
            // .getMany();

            // console.log(rolRepo);
            console.log(rol);
        
            let payload;
            payload = {
                rols: rol
            };

            if(rol){
                new Resolver().success(res, 'Rol correctly consulted', payload);
            }
        }
        catch(ex){
            new Resolver().exception(res, 'Unexpected error.', ex);
        }
    }
}