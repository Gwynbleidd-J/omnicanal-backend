import { NextFunction, Request, Response } from "express";
import { Resolver } from '../services/resolver';
import { getRepository, createConnection } from 'typeorm';
import { getConnection } from "typeorm";
import { Llamadas } from '../models/llamadas';

export class TablaController{
    public async getData(req:Request, res:Response): Promise <void>{

        try{
            const mysqlConnection = getConnection('second-connection')
            //console.log(`Consultando la base de datos prueba`);
            const prueba = await mysqlConnection.query(`SELECT * FROM tabla;`);
            //const prueba = await mysqlConnection.query(`INSERT INTO ('${Llamadas}') SELECT * FROM tabla`);
            //console.table(prueba);
            //new Resolver().success(res, `Consulta exitosa a la tabla de prueba`, prueba);
            
            let payload = {
                prueba
            }
            
             let data;
            for (const key in payload) {
                data = payload[key];
            }
            //console.log(`Nombre: ${payload.prueba[0].Nombre}`);
            
            //new Resolver().success(res, `Consulta exitosa a la tabla de prueba`, payload);
            //console.log(payload);
            
            if(payload){
                //console.log(prueba)
                //console.log(`Se recibieron datos desde la base de datos de prueba`)
                const mysqlConnection = getConnection('default')
                //const post = await mysqlConnection.query(`INSERT INTO llamadas(\"idtabla\", \"Nombre\", \"Apellido\", \"Trabajo\", \"Puesto\") VALUES(${payload.prueba.Nombre})`);
                const post = await mysqlConnection.getRepository(Llamadas)
                .createQueryBuilder()
                .insert()
                .into(Llamadas)
                .values(prueba)
                .onConflict(`("idtabla") DO NOTHING`)
                .execute();
                console.log(`se insertaron datos en la tabla de postgres`);
                /* const post = await mysqlConnection.getRepository(Llamadas)
                .createQueryBuilder()
                .insert()
                .into(Llamadas)
                .values(data)//.values(prueba)
                .execute(); */
                
                //console.table(prueba);
                new Resolver().success(res, `Insercion en la tabla llamadas`, post);
            }
            else{
                new Resolver().error(res, `Error al consultar una tabla`);
            }
        }
        catch(ex){
            new Resolver().exception(res, 'Unexpected error.', ex);
        }
    }
    
    /* public async provisionalTriggerForActiveChats(agentId:number):Promise<void>{
        let updateResult:boolean;
        let newActiveChats:number;
        //.set({ activeChats: () => "activeChats + 1" })
        //.set({ activeChats: 3})
        try{ 
            console.log('Iniciando consulta de la base de datos de Mysql');
            const actualActiveChats = await getRepository(CatUsers)
                .createQueryBuilder("user")
                .where(" user.ID = :id", {id: agentId})                   
                .getOne();
            let actualActiveChatsCuantity;
            
            
            if(actualActiveChats)
            {
                actualActiveChatsCuantity = {
                    actualActiveChats: actualActiveChats.activeChats
                }
                console.log(actualActiveChatsCuantity); 
                console.log(actualActiveChatsCuantity['actualActiveChats']); 
                actualActiveChatsCuantity['actualActiveChats'] = actualActiveChatsCuantity['actualActiveChats'] +1;
            }

            console.log('Iniciando update de chats activos del usuario: ' + agentId);
            const updatedActiveChats = await getRepository(CatUsers)
                .createQueryBuilder()
                .update(CatUsers) 
                .set({ activeChats: actualActiveChatsCuantity['actualActiveChats']})
                .where("ID = :id", { id: agentId})
                .execute();  
            // console.log(updatedChat); 

            if(updatedActiveChats.affected === 1) {
             
                console.log('activeChats actualizado correctamente'); //updateResult = true;  
            }
            else 
                console.log('No se pudo actualizar activeChats del agente'); //updateResult =false; 

        }
        catch(ex){
            console.log('Error[provisionalTriggerForActiveChats]' + ex);
            updateResult = false;
        }   
    } */
}