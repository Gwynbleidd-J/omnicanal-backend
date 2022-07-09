import { Resolver } from "./resolver";
import { Request, Response } from "express";

export class Whatsapp {
    private accountSID:String;
    private authToken:String;
    private whatsappAcount:String;
    // private client:any;

    private readonly client = require('twilio')(
        process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN, { lazyLoading: true });

    //NOTA: Preguntar a Diego la mejor manera de declarar los const en una clase
    // export constructor(){
    //     this.accountSID = process.env.TWILIO_ACCOUNT_SID;
    //     this.authToken = process.env.TWILIO_AUTH_TOKEN;
    //     this.whatsappAcount = process.env.WHATSAPP_ACOUNT;

    //     this.client  = require('twilio')(this.accountSID, this.authToken, { lazyLoading: true });
    // }

    //Método para el envío del mensaje automático.
    
    public async sendWelcomeMessage(whatsappClientAccount:String){
        try{
            // this.whatsappAcount = 'whatsapp:+5215592251986';
            this.whatsappAcount = 'whatsapp:+14155238886';

            await this.client.messages.create({
                to:   whatsappClientAccount,
                body: 'Bienvenido a la cuenta Oficial de PROMO ESPACIO, es importante recibir tu reporte para que todo opere correctamente. \nRecuerda pedir tu folio en caso de que tu reporte no quede resuelto en el momento. \nRecomendación: Deja los equipos encendidos ya que si continuamente los apagas suelen fallar. \nUn momento, uno de nuestros ingenieros te atenderá',
                from: this.whatsappAcount
                })
                .then(message => console.log('sendWelcomeMessage',message.sid));      
                console.log('Correctly WelcomeMessage sent to ' + whatsappClientAccount);  
        }
        catch(err){
            console.log('Error[sendWelcomeMessage]: ' + err);
        }
    }    

    public async replyMessageWaitingForAgent(whatsappClientAccount:String){
        try{
            
            // this.whatsappAcount = 'whatsapp:+5215592251986';
            this.whatsappAcount = 'whatsapp:+14155238886';
            this.client.messages.create({
                to:   whatsappClientAccount,
                body: 'Por el momento todos nuestros ingenieros se encuentran ocupados, por favor permanezca en línea.',
                from: this.whatsappAcount
                })
                .then(message => console.log('replyMessageWaitingForAgent', message.sid));   
                console.log('Correctly MessageWaitingForAgent sent to ' + whatsappClientAccount);  
        }
        catch(err){
            console.log('Error[replyMessageWaitingForAgent]: ' + err);
        }
    }

    public async replyMessageWaitingForAgentDesesperado(whatsappClientAccount:String){
        try{
            
            // this.whatsappAcount = 'whatsapp:+5215592251986';
            this.whatsappAcount = 'whatsapp:+14155238886'; 
            this.client.messages.create({
                to:   whatsappClientAccount,
                body: 'Por el momento todos nuestros ingenieros se encuentran ocupados, por favor permanezca en línea. Recuerda que también puedes hacer tu reporte a través de correo a: reporta@promoespacio.com.mx o por llamada al 55 9066 0010',
                from: this.whatsappAcount
                })
                .then(message => console.log('replyMessageWaitingForAgent', message.sid));   
                console.log('Correctly MessageWaitingForAgent sent to ' + whatsappClientAccount);  
        }
        catch(err){
            console.log('Error[replyMessageWaitingForAgent]: ' + err);
        }
    }

    public async replyMessageWaitingForAgentFueraDeHorario(whatsappClientAccount:String){
        try{
            
            // this.whatsappAcount = 'whatsapp:+5215592251986';
            this.whatsappAcount = 'whatsapp:+14155238886';
            this.client.messages.create({
                to:   whatsappClientAccount,
                body: 'Le recordamos que nuestro horario de atención es de 9 de la mañana a 9 de la noche. Por favor escríbenos a: reporta@promoespacio.com.mx y atenderemos tu reporte.',
                from: this.whatsappAcount
                })
                .then(message => console.log('replyMessageWaitingForAgent', message.sid));   
                console.log('Correctly MessageWaitingForAgent sent to ' + whatsappClientAccount);  
        }
        catch(err){
            console.log('Error[replyMessageWaitingForAgent]: ' + err);
        }
    }

    public async replyMessageOnClose(whatsappClientAccount:String){
        try{
            this.whatsappAcount = 'whatsapp:+14155238886';
            // this.whatsappAcount = 'whatsapp:+5215592251986';
            this.client.messages.create({
                to: whatsappClientAccount,
                body: 'Tu conversación con el analista acabó, ¡Que tengas un buen día! ',
                from: this.whatsappAcount
            })
            .then(message => console.log('replyMessageOnClose', message.sid));
        }
        catch(err){
            console.log('Error[Whatsapp][replyMessageOnClose]: ' + err);
        }
    }  

    public async replyMessageForAgent(message:String, profileName:String, whatsappAgentAccount:String){
        try{
            
            this.whatsappAcount = 'whatsapp:+14155238886';
            // this.whatsappAcount = 'whatsapp:+5215592251986';
            this.client.messages.create({
                to:   whatsappAgentAccount,
                body: profileName +' dice: ' + message,
                from: this.whatsappAcount
                })                
                .then(message => console.log('replyMessageForAgent',message.sid)); 
                console.log('Correctly MessageForAgent sent to ' + whatsappAgentAccount);  
        }
        catch(err){
            console.log('Error[replyMessageForAgent]: ' + err);
        }
    }
    
    public async replyMessageForClient(message:String, whatsappClientAccount:String){
        try{
            // whatsappClientAccount = 'whatsapp:+5215551438864';
            this.whatsappAcount = 'whatsapp:+14155238886';
            // this.whatsappAcount = 'whatsapp:+5215592251986';
            this.client.messages.create({
                to:   whatsappClientAccount,
                body: message,
                from: this.whatsappAcount
                })
                .then(message => console.log('[replyMessageForClient]:Message sent',message.sid)); 
                
                console.log('Correctly MessageForClient sent to ' + whatsappClientAccount);  
        }
        catch(err){
            console.log('Error[Whatsapp][replyMessageForClient]: ' + err);
        }
    }

    public async replyImageMessageForClient(mediaUrl:any, whatsappClientAccount:string){
        // this.whatsappAcount = 'whatsapp:+5215592251986';
        this.whatsappAcount = 'whatsapp:+14155238886';
        this.client.messages.create({
            from: this.whatsappAcount,
            mediaUrl: [mediaUrl],
            to: whatsappClientAccount,
        })
        .then(message => console.log('[replyImageMessageForClient]:Message sent', message.sid))
        .catch(error => console.log(`[replyImageMessageForClient]:${error}`))
    }
}