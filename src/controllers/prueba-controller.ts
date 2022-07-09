import { Request, Response } from "express";  
import { Resolver } from '../services/resolver';
import { Whatsapp } from "../services/whatsapp";
export class PruebaController{

    public async Prueba(req:Request, res:Response): Promise<any>{
        try{
            let option = req.body.CurrentInput
            console.log(req.body);
            let resObj = {};

            let message = "Estimado usuario te recordamos que nuestro horario de atención es de 9 a.m. a 9 p.m.\nRecuerda que también puedes reportar fallas, enviar quejas y sugerencias a reporta@promoespacio.com.mx.\nGracias por comunicarse a Promo Espacio";

            if(option === '2' || option === '3'){
                resObj = {
                    "actions" : [
                        {"say" : message}
                    ]
                }

                res.send(resObj);
            }

            else if(option === '1'){
                resObj = {
                    "actions": [
                        {
                            "collect": {
                                "name": "collect_2_user_option",
                                "questions": [{
                                    "question": "Elija una de las siguientes opciones: 1.Contenido desactualizado.\n2.Pantalla en negro.\n3.Pantalla apagada",
                                    "name": "option_choosen_2",
                                    "type": "Twilio.NUMBER"
                                    
                                },
                                ],
                                "on_complete": {
                                    "redirect": "https://iceberg-mandrill-5508.twil.io/second_option_choosen"
                                    
                                }
                                
                            }
                            
                        }
                    ]
                }
                res.send(resObj);
            }
        }
        catch(ex)
        {
            console.log(`${ex}`);
        }
    }
}