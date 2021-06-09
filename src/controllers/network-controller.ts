import { NextFunction, Request, Response } from "express";
import { Resolver } from '../services/resolver';
import { getRepository } from 'typeorm';
import { CatNetworks } from '../models/network';

export class NetworkController{
    public async getNetWorks(req:Request, res:Response): Promise<void>{
        try{
            console.log('Consultando networks');
            //console.log(req.body);
            const networks = await getRepository(CatNetworks)
            .createQueryBuilder("network")
            //.leftJoinAndSelect("network.name", 'name')
            //.where("network.id = :id", {id: req.body.id})
            .getMany();

            let payload = {
                networks: networks 
            };

            if(networks)
                {
                    console.log(networks);
                    new Resolver().success(res, 'Networks correctlyconsulted', payload);            
                }
            else 
            { 
                new Resolver().error(res, 'Invalid network information.');
            }
        }
        catch(ex) {
            new Resolver().exception(res, 'Unexpected error.', ex);
        }
    }
}