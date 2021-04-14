import { Twilio } from 'twilio';

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
    public async sendWelcomeMessage(whatsappClientAccount:String, ){
        try{
            
            this.whatsappAcount = 'whatsapp:+14155238886';

            await this.client.messages.create({
                to:   whatsappClientAccount,
                body: 'Hola. Gracias por escribir al Whatsapp de PromoEspacio. En un momento le enlazamos.',
                from: this.whatsappAcount
                });      
                console.log('Correctly WelcomeMessage sent to ' + whatsappClientAccount);  
        }
        catch(err){
            console.log('Error: ' + err);
        }
    }    

    public async replyMessageWaitingForAgent(whatsappClientAccount:String, ){
        try{
            
            this.whatsappAcount = 'whatsapp:+14155238886';
            this.client.messages.create({
                to:   whatsappClientAccount,
                body: 'Seguimos conectando con un agente disponible, agradecemos tu paciencia.',
                from: this.whatsappAcount
                });  
                console.log('Correctly MessageWaitingForAgent sent to ' + whatsappClientAccount);  
        }
        catch(err){
            console.log('Error: ' + err);
        }
    }    

    public async replyMessageForAgent(message:String, profileName:String, whatsappAgentAccount:String){
        try{
            
            this.whatsappAcount = 'whatsapp:+14155238886';
            this.client.messages.create({
                to:   whatsappAgentAccount,
                body: profileName +' dice: ' + message,
                from: this.whatsappAcount
                }); 
                console.log('Correctly MessageForAgent sent to ' + whatsappAgentAccount);  
        }
        catch(err){
            console.log('Error: ' + err);
        }
    }
    
    public async replyMessageForClient(message:String, profileName:String, whatsappClientAccount:String){
        try{
            
            this.whatsappAcount = 'whatsapp:+14155238886';
            this.client.messages.create({
                to:   whatsappClientAccount,
                body: message,
                from: this.whatsappAcount
                }); 
                
                console.log('Correctly MessageForClient sent to ' + whatsappClientAccount);  
        }
        catch(err){
            console.log('Error: ' + err);
        }
    }


}