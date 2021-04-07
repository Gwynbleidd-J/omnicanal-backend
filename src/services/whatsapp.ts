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

    //Método para el envío del mensaje automático
    public async sendWelcomeMessage(message:String, whatsappClientAccount:String, ){
        try{
            
            this.whatsappAcount = 'whatsapp:+14155238886';

            await this.client.messages.create({
                to:   whatsappClientAccount,
                body: message,
                from: this.whatsappAcount
                });     
                
                console.log('Send to ' + this.whatsappAcount + ' correct');
        }
        catch(err){
            console.log('Error: ' + err);
        }
    }    

    public async replyMessage(message:String, whatsappClientAccount:String, ){
        try{
            
            this.whatsappAcount = 'whatsapp:+14155238886';

            await this.client.messages.create({
                to:   whatsappClientAccount,
                body: 'Bienvenido al sistema de soporte . En momento le enlazamos con un agente...',
                from: this.whatsappAcount
                }); 
                //Validar el envío, para una vez que se haya iniciado la comunicación con el cliente a partir 
                // de esta primer respuesta, disparar el algoritmo para buscar un agente disponible
                
                console.log('Send to ' + this.whatsappAcount + ' correct');
        }
        catch(err){
            console.log('Error: ' + err);
        }
    }    
}