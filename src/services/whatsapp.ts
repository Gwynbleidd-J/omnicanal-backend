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
            +14155238886
            // this.whatsappAcount = 'whatsapp:+5215592251986';
            this.whatsappAcount = 'whatsapp:+14155238886';

            await this.client.messages.create({
                to:   whatsappClientAccount,
                body: 'Hola. Gracias por escribir al Whatsapp de PromoEspacio. En un momento le enlazamos.',
                from: this.whatsappAcount
                })
                .then(message => console.log('sendWelcomeMessage',message));      
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
                body: 'Seguimos conectando con un analista disponible, agradecemos tu paciencia.',
                from: this.whatsappAcount
                })
                .then(message => console.log('replyMessageWaitingForAgent', message));   
                console.log('Correctly MessageWaitingForAgent sent to ' + whatsappClientAccount);  
        }
        catch(err){
            console.log('Error[replyMessageWaitingForAgent]: ' + err);
        }
    }

    public async replyMessageOnClose(whatsappClientAccount:String){
        try{
            // this.whatsappAcount = 'whatsapp:+5215592251986';
            this.whatsappAcount = 'whatsapp:+14155238886';
            this.client.messages.create({
                to: whatsappClientAccount,
                body: 'Tu coversación con el analista acabo, ¡Que tengas un buen día! ',
                from: this.whatsappAcount
            })
            .then(message => console.log('replyMessageOnClose', message));
        }
        catch(err){
            console.log('Error[Whatsapp][replyMessageOnClose]: ' + err);
        }
    }  

    public async replyMessageForAgent(message:String, profileName:String, whatsappAgentAccount:String){
        try{
            
            // this.whatsappAcount = 'whatsapp:+14155238886';
            this.whatsappAcount = 'whatsapp:+14155238886';
            this.client.messages.create({
                to:   whatsappAgentAccount,
                body: profileName +' dice: ' + message,
                from: this.whatsappAcount
                })                
                .then(message => console.log('replyMessageForAgent',message)); 
                console.log('Correctly MessageForAgent sent to ' + whatsappAgentAccount);  
        }
        catch(err){
            console.log('Error[replyMessageForAgent]: ' + err);
        }
    }
    
    public async replyMessageForClient(message:String, whatsappClientAccount:String){
        try{
            // whatsappClientAccount = 'whatsapp:+5215551438864';
            // this.whatsappAcount = 'whatsapp:+5215592251986';
            this.whatsappAcount = 'whatsapp:+14155238886';
            this.client.messages.create({
                to:   whatsappClientAccount,
                body: message,
                from: this.whatsappAcount
                })
                .then(message => console.log('replyMessageForClient',message)); 
                
                console.log('Correctly MessageForClient sent to ' + whatsappClientAccount);  
        }
        catch(err){
            console.log('Error[Whatsapp][replyMessageForClient]: ' + err);
        }
    }
}