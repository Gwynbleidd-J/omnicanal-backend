import { Request, Response} from "express";
import {getRepository} from "typeorm";
import {CatMenus} from "../models/menu";
import {Resolver} from "../services/resolver";

export class MenuController {

    public async getAllMenus(req:Request, res:Response): Promise<void>{
        
        try{
            const allMenus = await getRepository(CatMenus).find();

            let payload = {
                menus: allMenus
            };

            if(allMenus){
                new Resolver().success(res, 'Menus correctly consulted', payload);
            }
            else {
                new Resolver().exception(res, 'Invalid menus info.');  
            }

            
        }
        catch(ex){
            new Resolver().exception(res, 'Unexpected error. ', ex);
        }
    }

    public async getMenu(req:Request, res:Response): Promise<void>{
        try{
            const menus = await getRepository(CatMenus)
            .createQueryBuilder("menu")
            .where("menu.id = :id", {id: req.body.id})
            .getMany(); 

            if(menus){
                new Resolver().success(res, 'Menus correctly consulted', menus);
            }
            else{
                new Resolver().exception(res, 'Invalid menus info.');
            } 
                
            
        }
        catch(ex){
            new Resolver().exception(res, 'Unexpected error. ', ex);
        }
    }
}