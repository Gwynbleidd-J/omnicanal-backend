import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import { getRepository } from "typeorm";
import {CatPermissions} from "../models/permission"; 

import { Resolver } from "../services/resolver"; 

export class PermissionController{
    public async getRolPermissions(req:Request, res:Response): Promise<void>{
        try{
            console.log(req.body.rolId);
            const rolPermissions = await getRepository(CatPermissions)
            .createQueryBuilder("permission")
            .where("permission.rolId = :rolId", {rolId: req.body.rolId})
            .getMany();

            let payload = {
                permissions: rolPermissions 
            };

            if(rolPermissions)
                {
                     console.log(rolPermissions);
                    new Resolver().success(res, 'Chats correctlyconsulted', payload);            
                }
            else 
            { 
                new Resolver().error(res, 'Invalid chat information.');
            }
        }
        catch(ex) {
            new Resolver().exception(res, 'Unexpected error.', ex);
        }
    }
}