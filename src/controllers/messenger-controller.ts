import { OpeChatHistoric } from './../models/chatHistorical';
import { Socket } from './../services/socket';
import { CatUsers } from './../models/user'; 
import { Whatsapp } from '../services/whatsapp';
import { NextFunction, Request, Response } from "express";
import { OpeChats } from './../models/chat';
import { getRepository, SimpleConsoleLogger, UpdateResult } from "typeorm";
import { Resolver } from "../services/resolver";
import { Telegraf } from 'telegraf';  
 
export class MessengerController {
    
    private telegraf:Telegraf;
    private contextoGenerico:any;

    constructor(telegraf?:Telegraf) {
        this.telegraf = new Telegraf(process.env.BOT_TOKEN);
    }
    
    /* #region Comments */
    /*
    Método:     incommingMessage
    Parámetros:  Recibe el request que viene desde la petición hecha a la API. 
    Descripción: Se llama este método específicamente cuando el mensaje entrante es de whatsapp, dentro e proceso redirecciona
                hacia el método de estandarización de los mensajes. Se pasa como parámetro la letra 'W' para indicar que es un
                mensaje desde whatsapp.
    Devuelve:  
    Creó: J. Carlos Lara
    Fecha: Abril 09 de 2021
    */
   /* #endregion */ 
    public async whatsappIncommingMessage(req:Request, res:Response): Promise<void> {        
        try{   
            MessengerController.prototype.standardizeIncommingMessage(req.body,'w');            
        }
        catch(ex){
            new Resolver().exception(res, 'Unexpected error.', ex);
            console.log('Error[incommingMessage]:' + ex);
        }
    }

    /*MÉTODO:       messageIn(Método original para enviar el msg de bienvenida, de espera y el de comunicación activa)
      Descripción:  Capta el mensaje enviado por el cliente
                    En este punto, validar si ya existe un chat activo de este cliente o sería un mensaje de bienvenida
    */ 
    public async messageIn(messageContext:JSON){
        try{ 
            //Pasos para el mensaje entrante:
            console.log('Procesando mensaje entrante de: ' + messageContext['clientPlatformIdentifier']);                                                        
            const existingChat = await this.chatAlreadyExist(messageContext['clientPlatformIdentifier'], messageContext['platformIdentifier']);
            //Verificar existencia del mismo 
            const jsonExistingChat = await existingChat; 
            console.log('Chat con estatus: ' + jsonExistingChat.statusId);
 
            if(jsonExistingChat.statusId == 0){
                console.log('Chat sin registro previo, generando registro inicial en BD...');
                const insertedChatId = await this.registryInitialChat(messageContext); 
                const jsonInsertedChat = await insertedChatId; 
                messageContext['id'] = insertedChatId; 
                this.sendWelcomeMessage(messageContext); 
                const disponibleAgent = await this.getDisponibleAgent(messageContext['platformIdentifier']); 
                const jsonDisponibleAgent = await disponibleAgent; 
                //validar el id del agente disponible devuelto[si es 0, entonces mandar mensaje de espera y no actualizar el estatus del Chat]
                console.log('jsonDisponibleAgent: ' + jsonDisponibleAgent.userId);
                if(jsonDisponibleAgent.userId != '0'){     
                    console.log('Agente disponible: ' + jsonDisponibleAgent.userId + ' con ip[' + jsonDisponibleAgent.agentPlatformIdentifier +']');                 
                    const assignedChat = await this.assignChatAgent(jsonDisponibleAgent.userId, messageContext); 
                    
                    if(assignedChat){    //Enviar el mensaje al agente asignado 
                        messageContext['userId'] = jsonDisponibleAgent.userId;  
                        messageContext['agentPlatformIdentifier'] = jsonDisponibleAgent.agentPlatformIdentifier; 
                        this.replyMessageForAgent(messageContext); 

                        //De momento se usará este método para cubrir la funcionalidad del Trigger desde BD
                        this.provisionalTriggerForActiveChats(messageContext['userId']);
                    }
                }
                else{
                    console.log('No se pudo asignar a ningún agente por el momento');
                    this.replyMessageWaitingForAgent(messageContext);
                }
            }
            else if(jsonExistingChat.statusId == 1){
                console.log('Chat previo sin agente, volviendo a canalizar...'); 
                messageContext['id'] = jsonExistingChat.id; 
                const disponibleAgent = await this.getDisponibleAgent(messageContext['platformIdentifier']);
                const jsonDisponibleAgent = await disponibleAgent;
                
                if(jsonDisponibleAgent.userId != '0'){     
                    console.log('Agente disponible: ' + jsonDisponibleAgent.userId + ' con identificador: ' + jsonDisponibleAgent.agentPlatformIdentifier);                 
                    const assignedChat = await this.assignChatAgent(jsonDisponibleAgent.userId, messageContext);
                
                    if(assignedChat){    //Enviar el mensaje al agente asignado 
                        messageContext['userId'] = jsonDisponibleAgent.userId;  
                        messageContext['agentPlatformIdentifier'] = jsonDisponibleAgent.agentPlatformIdentifier; 
                        this.replyMessageForAgent(messageContext);  

                        //De momento se usará este método para cubrir la funcionalidad del Trigger desde BD
                        this.provisionalTriggerForActiveChats(messageContext['userId']);
                    }
                }
                else{
                    console.log('No se pudo asignar a ningún agente por el momento'); 
                    this.replyMessageWaitingForAgent(messageContext);
                }
            }
            else if(jsonExistingChat.statusId == 2){
                // console.log('Chat activo, dirigiendo el mensaje a su agente en turno...');  
                messageContext['id'] = jsonExistingChat.id;
                const agentPlatformIdentifier = await this.getAgentPlatformIdentifierForMessageContext(jsonExistingChat.userId, messageContext['platformIdentifier']);
                const jsonAgentPlatformIdentifier = await agentPlatformIdentifier;
                console.log('Ip del agente:' + jsonAgentPlatformIdentifier.agentPlatformIdentifier);
                // console.log(messageContext);
                messageContext['agentPlatformIdentifier'] = jsonAgentPlatformIdentifier.agentPlatformIdentifier;
                // console.log(messageContext);

                if(messageContext['agentPlatformIdentifier'])
                    this.replyMessageForAgent(messageContext);
                else
                console.log('Algo salió mal al obtener el contacto del agente');
            }
        }
        catch(ex)
        {
            console.log('Error[messageIn]:' + ex);
        }
    }
  
    public async registryInitialChat(messageContext:JSON):Promise<number>{
        try{ 
            const insertedOpeChat = await getRepository(OpeChats)
                            .createQueryBuilder() 
                            .insert() 
                            .into(OpeChats) 
                            .values([ 
                                {clientPlatformIdentifier: messageContext['clientPlatformIdentifier'], clientPhoneNumber: messageContext['clientPhoneNumber'], comments: messageContext['comments'], platformIdentifier: messageContext['platformIdentifier'], statusId: 1 } 
                            ])
                            .execute();  
            return insertedOpeChat.identifiers[0]['id'];
        }
        catch(ex){
            console.log('Error[registryInitialChat]:' + ex);
        }
    }

    public sendWelcomeMessage(messageContext:JSON):void{
        try{ 
            console.log(messageContext)
            if(messageContext['platformIdentifier'] == 'w') 
                new Whatsapp().sendWelcomeMessage(messageContext['clientPlatformIdentifier']); 
            else if(messageContext['platformIdentifier'] == 't') 
                this.telegraf.telegram.sendMessage(messageContext['clientPlatformIdentifier'],'Hola. Gracias por escribir al Telegram de PromoEspacio. En un momento le enlazamos con un agente.');                                             
        }
        catch(ex){
            console.log('Error[sendWelcomeMessage]:' + ex);
        }
    }

    public replyMessageWaitingForAgent(messageContext:JSON):void{
        try{ 
            //Nuevo proceso: registrar los mgs entrantes aunque no tenga un agente[para conservar el histórico]
            console.log(messageContext)
            const insertedChatHistoricId = this.registryIndividualMessage(messageContext); 
            if(insertedChatHistoricId){
                if(messageContext['platformIdentifier'] == 'w')
                    new Whatsapp().replyMessageWaitingForAgent(messageContext['clientPlatformIdentifier']); 
                else if(messageContext['platformIdentifier'] == 't') 
                    this.telegraf.telegram.sendMessage(messageContext['clientPlatformIdentifier'], 'Seguimos conectando con un agente disponible, agradecemos tu paciencia.');                 
            }
        }
        catch(ex){
            console.log('Error[replyMessageWaitingForAgent]:' + ex); 
        }
    }

    public replyMessageForAgent(messageContext:JSON):void{
        try{    
            // console.log('Entrando en replyMessageForAgent');
            const insertedChatHistoricId = this.registryIndividualMessage(messageContext);  
            // console.log('insertado con id: '+ insertedChatHistoricId);
            var sentNotification = 0; 
            
            let copiaGlobalArraySockets = global.globalArraySockets;

            if(insertedChatHistoricId)
            {   
                // console.log('Estado del Array Interno'); console.log(copiaGlobalArraySockets);
                // console.log('Estado del Array global'); console.log(global.globalArraySockets);

                copiaGlobalArraySockets.forEach(element => {                    
                    // console.log('Comprobando ' + element.remoteAddress +' vs '+  messageContext['agentPlatformIdentifier']);
                    //Por alguna razón está encontrando 2 sockets iguales en el arreglo, validar de momento solo enviar una notificación
                    if((element.remoteAddress == '::ffff:'+messageContext['agentPlatformIdentifier']) && (sentNotification < 1)){
                        console.log('Direccionando mensage al socket ' + element.remoteAddress);
                        new Socket().replyMessageForAgent(messageContext, element);           
                        sentNotification++;
                    }
                }); 
                global.globalArraySockets = copiaGlobalArraySockets;  
            }
           
            //console.log('Mensaje enviado, estoy de vuelta en replyMessageForAgent');
        }
        catch(ex){
            console.log('Error[messenger-controller][replyMessageForAgent]:' + ex);
        }
    }

    /* #region Comments */
    /*
    Método:     chatAlreadyExist
    Parámetros: clientPlatformIdentifier[Identificador del cliente asignado en Twilio]
                platformIdentifier['w' o 't' segpún la plataforma desde donde está entrando el mensaje]
    Descripción: Valida la existencia de un chat activo con el cliente que realiza la petición  
    Devuelve: Un Int[Number] con el status_Id del chat[en caso de haber un registro]
                0[No hay registro, hay que generar uno nuevo]
                1[El cliente ya había iniciado un chat pero aún no se le ha asignado un agente]
                2[El chat del cliente ya está en proceso con un agente(idear como enlazar ese mensaje al agente)]

    Creó: J. Carlos Lara
    Fecha: Abril 08 de 2021
    */
   /* #endregion */ 
    public async chatAlreadyExist(clientPlatformIdentifier:String, platformIdentifier:String):Promise<any>{
        statusId:Number;
        try{  
            const chat = await getRepository(OpeChats)
                .createQueryBuilder("chat")
                .where("chat.platformIdentifier = :platformIdentifier", {platformIdentifier: platformIdentifier})
                .andWhere("chat.clientPlatformIdentifier = :clientPlatformIdentifier", {clientPlatformIdentifier: clientPlatformIdentifier})
                .andWhere("chat.statusId != :statusId", {statusId: 3})
                .orderBy("chat.id", "DESC")
                .getOne();

            let payload; 

            if(chat)
            {
                payload = {
                    id: chat.id,
                    statusId: chat.statusId, 
                    userId: chat.userId
                };
               return payload;
            }
            else 
            {
                payload = {
                    id: '',
                    statusId: '0', 
                    userId: null
                };
              return payload;
            }

        }
        catch(ex){
            console.log('Error[chatAlreadyExist]: ' + ex)
        }
    }

    /* #region Comments */
    /*
    Método:     
    Parámetros:  
    Descripción:Este método se llama al momento de recibir un nuevo whatsapp/telegram, se manda 
    Devuelve:   un objeto JSON para poder usarse se forma genérica en los métodos del controlador de mensajes

    Creó: J. Carlos Lara
    Fecha: Abril 08 de 2021
    */
   /* #endregion */ 
   //public standardizeMessageContext(Ctx:any, platformIdentifier:String){ 
    public standardizeIncommingMessage(ctx, platformIdentifier:String): void{
        try{ 
            console.log('Probando contexto de mensaje de ' + platformIdentifier);
             console.log(ctx);

            let messageContext;
            
            if(platformIdentifier == 't')
            { 
                //Generar el JSON a partir del ctx de Telegram
                const Context:JSON = <JSON><unknown>{
                    "id": '', 
                    "clientPlatformIdentifier": ctx.from.id, 
                    "clientPhoneNumber": '', 
                    "comments": ctx.message.text, 
                    "platformIdentifier": platformIdentifier 
                    , "clientName": ctx.from.first_name 
                    , "userId": '' 
                    , "agentPlatformIdentifier": '' 
                    , "messagePlatformId": ctx.message.message_id
                    , "transmitter": 'c'
                  }
                  messageContext = Context;
            }
            else if(platformIdentifier == 'w')
            {
                //Generar el JSON a partir del ctx de Whatssap
                    const Context:JSON = <JSON><unknown>{
                    "id": '',
                    "clientPlatformIdentifier": ctx.From, 
                    "clientPhoneNumber": ctx.WaId, 
                    "comments": ctx.Body, 
                    "platformIdentifier": platformIdentifier
                    , "clientName": ctx.ProfileName
                    , "userId": ''
                    , "agentPlatformIdentifier": ''
                    , "messagePlatformId": ctx.SmsMessageSid
                    , "transmitter": 'c'
                  }
                  messageContext = Context;
            }
 
            if(messageContext['clientPlatformIdentifier'] != 'whatsapp:+14155238886')
            {
                //console.log('Mensaje estandarizado correctamente, enviando al despachador...');     
                // console.log('Mensage de whats en formato JSON: ');
                // console.log(messageContext);       
                this.messageIn(messageContext);
            }
            
        }
        catch(ex){ 
            console.log('Error[standardizeIncommingMessage]: ' + ex);
        }
    }
 
    public async getDisponibleAgent(platformIdentifier:String):Promise<any>{
        try{ 
            const user = await getRepository(CatUsers)
                .createQueryBuilder("user")
                .where(" user.activeChats < :activeChats", {activeChats: 4})  
                // .andWhere(" user.statusId = :statusId", {statusId: 1}) //Contemplar después añadir el filtro para el estatus del usuario
                .orderBy(" user.activeChats", "ASC") 
                .getOne();

            let payload; 

            if(user)
            {
                payload = {
                    userId: user.ID,  
                    activeChats: user.activeChats                
                };  
                ////Proceso original: Según el platformIdentifier se devolvía el 'contacto' del agente dispponible.
                // if(platformIdentifier === 'w')
                //     payload['agentPlatformIdentifier'] = user.agentIdentifierWhatsapp;
                // else
                //     payload['agentPlatformIdentifier'] = user.agentIdentifierTelegram;

                ////Proceso actualizado: Se devolverá el activeIp del agente para emplearlo en los sockets
                payload['agentPlatformIdentifier'] = user.activeIp;

                console.log(payload);
                return payload;
            }
            else 
            {
                payload = {
                    userId: 0,  
                    agentPlatformIdentifier: '',
                    activeChats: 0                   
                };
              return payload;
            }
        }
        catch(ex)
        {
            console.log('Error[getDisponibleAgent]: ' + ex);
        }
    }
 
    public async assignChatAgent(agentId:any, messageContext:JSON):Promise<boolean>{
        let updateResult:boolean;

        try{ 
            const updatedChat = await getRepository(OpeChats)
                .createQueryBuilder()
                .update(OpeChats)
                .set({ userId: agentId, statusId: 2})
                .where("id = :id", { id: messageContext['id'] })
                .execute();  
            // console.log(updatedChat); 

            if(updatedChat.affected === 1) 
                updateResult = true;  
            else 
                updateResult =false; 

        }
        catch(ex){
            console.log('Error[assignChatAgent]' + ex);
            updateResult = false;
        }  
        return updateResult;
    }

    public async getAgentPlatformIdentifierForMessageContext(agentId:any, platformIdentifier:String):Promise<any>{
        try{ 
            // console.log('Buscando registro del User ' + agentId + ' de plataforma ' + platformIdentifier);
            const user = await getRepository(CatUsers)
                .createQueryBuilder("user")
                .where(" user.ID = :id", {id: agentId})                   
                .getOne();

            let payload; 

            if(user)
            {
                payload = { 
                    userId: user.ID,  
                    activeChats: user.activeChats 
                };   
                ////Proceso actualizado: Se devolverá el activeIp del agente para emplearlo en los sockets
                payload['agentPlatformIdentifier'] = user.activeIp;

                // console.log(payload);
                return payload;
            }
            else 
            {
                payload = {
                    userId: 0,  
                    agentPlatformIdentifier: '',
                    activeChats: 0                   
                };
              return payload;
            }
        }
        catch(ex)
        {
            console.log('Error[getAgentPlatformIdentifierForMessageContext]: ' + ex);
        }
    }

    public async provisionalTriggerForActiveChats(agentId:number):Promise<void>{
        let updateResult:boolean;
        let newActiveChats:number;
        //.set({ activeChats: () => "activeChats + 1" })
        //.set({ activeChats: 3})
        try{ 
            console.log('Iniciando consulta de chats activos');
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
    }
  
    /*
    Método:     replymessageForClient
    Parámetros: agentIp:La ip del emisor(agente), messageString: cadena en formato JSON que contiene[mensaje, chatId y platFormIdentifier]. 
    Descripción:Este método se ejecuta cunado llega un mensaje nuevo desde alguno de los agentes. (Se dispara en el servicio de Sockets)
    Devuelve:   VOID, manda a llamar internamente el proceso para dirigir ese msg al cliente correspondiente.

    Creó: J. Carlos Lara
    Fecha: Abril 08 de 2021
    */
    public async replymessageForClient(outMessageContext:any): Promise<void>{
        try{
            console.log('Enviando mensaje de espera para: ' + outMessageContext['clientPlatformIdentifier']);

            if(outMessageContext['platformIdentifier'] == 'w')
                new Whatsapp().replyMessageForClient(outMessageContext['text'], outMessageContext['clientPlatformIdentifier']);
            else if(outMessageContext['platformIdentifier'] == 't')
                this.telegraf.telegram.sendMessage(outMessageContext['clientPlatformIdentifier'], outMessageContext['text']);    
        }
        catch(ex){
            console.log('Error[replymessageForClient]' + ex);
        }
    }

    public standardizeOutcommingMessage(agentIp:String, message:String): void{
        try{ 
            
             
            console.log('Recibiendo y estandarizando mensaje de Sokcet de ' + agentIp);  
            console.log(message);

            let messageContext = JSON.parse(message.toString());   
            console.log('Mensage en formato JSON: ');
            console.log(messageContext);   
            
            console.log('Mensaje estandarizado correctamente, enviando al despachador...');        
            this.messageOut(messageContext);
            
        }
        catch(ex){ 
            console.log('Error[standardizeOutcommingMessage]: ' + ex);
        }
    }

    public async messageOut(messageContext:JSON){
        try{
            if(messageContext['platformIdentifier'] == 't')
            {
                this.telegraf.telegram.sendMessage(messageContext['clientPlatformIdentifier'], messageContext['comments']);     
                const insertedChatHistoricId = this.registryIndividualMessage(messageContext);                                 
            } 
            else if(messageContext['platformIdentifier'] == 'w')
            {
                new Whatsapp().replyMessageForClient(messageContext['comments'], messageContext['clientPlatformIdentifier']); 
                const insertedChatHistoricId = this.registryIndividualMessage(messageContext);  
            }

        }
        catch(ex){
            console.log('Error[messageOut]' + ex);
        }
    }

    public async registryIndividualMessage(messageContext:JSON):Promise<number>{
        try{ 
            // console.log(messageContext);
            const insertedOpeChatHistoric = await getRepository(OpeChatHistoric)
                            .createQueryBuilder() 
                            .insert() 
                            .into(OpeChatHistoric) 
                            .values([ 
                                {messagePlatformId: messageContext['messagePlatformId'], text: messageContext['comments'], chatId: messageContext['id'], transmitter: messageContext['transmitter'], statusId: 1 } 
                            ])
                            .execute();  
            // console.log(insertedOpeChatHistoric);
            return insertedOpeChatHistoric.identifiers[0]['id'];
        }
        catch(ex){
            console.log('Error[registryIndividualMessage]:' + ex);
        }
    }

    //SECCIÓN: Métodos para el re-estructurado de los procesos de mensagería, haciendo las peticiones por HTTP.

    /**Método para obtener todos los mensajes del chat[ya sea para recuperar una ventana cerrada o para uso del coordinador ] */
    public async getMessages(req:Request, res:Response): Promise<void>{
        try{ 
            // console.log('Solicitando mensages del chat: ' + req.body.chatId);

            const unreadMessages = await getRepository(OpeChatHistoric)
            .createQueryBuilder("unreadMessages")
            .where("unreadMessages.chatId = :chatId", {chatId: req.body.chatId})  
            .andWhere("unreadMessages.statusId = :statusId", {statusId: 1})     
            .andWhere("unreadMessages.id > :id", {id: req.body.id? req.body.id:1})
            .orderBy("id", "DESC") 
            .getMany();            

            let payload = {
                messages: unreadMessages
            };

            if(unreadMessages)
                {
                    // console.log(unreadMessages);
                    new Resolver().success(res, 'Chats correctlyconsulted', payload);            
                }
            else 
            { 
                new Resolver().error(res, 'Invalid chat information.');
            }

        }
        catch(ex){
            console.log('Error[getMessages]' + ex);
            new Resolver().exception(res, 'Unexpected error.', ex);
        }
    }
  
    public async outcommingMessage(req:Request, res:Response): Promise<void>{
        let telegraf:Telegraf = new Telegraf(process.env.BOT_TOKEN);
        let copiaGlobalArraySockets = global.globalArraySockets;
        let backNotificationContext; 
        var sentNotification = 0; 

        try {
            console.log("entrando a outcommingMessage");  
            getRepository(OpeChatHistoric).save(req.body)
            .then(result => new Resolver().success(res, 'Register succesfull', result))                  
            .catch(error => new Resolver().error(res, 'Register error', error)); 
                
            if(req.body.platformIdentifier == 'w')
                new Whatsapp().replyMessageForClient(req.body.text, req.body.clientPlatformIdentifier);
            else if(req.body.platformIdentifier == 't')
                telegraf.telegram.sendMessage(req.body.clientPlatformIdentifier, req.body.text); 
                    
            console.log('Construyendo el Context en JSON...');
            //De forma provisional, se enviará una notificación de vuelta al agente para que se refresque su ventana del chat             
            const Context:JSON = <JSON><unknown>{ 
                "id": req.body.chatId, 
                "platformIdentifier": req.body.platformIdentifier, 
                "clientPlatformIdentifier": req.body.clientPlatformIdentifier,  
                "agentPlatformIdentifier": req.body.agentPlatformIdentifier 
            }

            console.log('Seteando el context al backNotificationContext...');
            backNotificationContext = Context;
            console.log(backNotificationContext);
            
            console.log('Iniciando barrido del arreglo de sockets...');
            // console.log(copiaGlobalArraySockets);
            copiaGlobalArraySockets.forEach(element => {                    
                console.log('Comprobando ' + element.remoteAddress +' vs '+  backNotificationContext['agentPlatformIdentifier']);
                //Por alguna razón está encontrando 2 sockets iguales en el arreglo, validar de momento solo enviar una notificación
                if((element.remoteAddress == '::ffff:'+backNotificationContext['agentPlatformIdentifier']) && (sentNotification < 1)){
                    console.log('Direccionando mensage al socket ' + element.remoteAddress);
                    new Socket().replyMessageForAgent(backNotificationContext, element);           
                    sentNotification++;
                }
            }); 
            global.globalArraySockets = copiaGlobalArraySockets;  
            console.log('Envío de notificación termidado.');
        }
        catch(ex) { 
            console.log('Error[outcommingMessage]' + ex); 
            new Resolver().exception(res, 'Unexpected error.', ex); 
        } 
    }

    public async recoverActiveChats(req:Request, res:Response): Promise<void>{
        try{ 
            console.log('Recuperando mensajes del agente: ' + req.body.userId);

            const recoveredChats = await getRepository(OpeChats)
            .createQueryBuilder("recoveredChats") 
            .where("recoveredChats.userId = :userId", {userId: req.body.userId})  
            .andWhere("recoveredChats.statusId = :statusId", {statusId: 2})      
            .orderBy("id", "DESC") 
            .getMany();            

            let payload = {
                chats: recoveredChats
            };

            if(recoveredChats){
                    console.log(recoveredChats);
                    new Resolver().success(res, 'Chats correctly consulted', payload);            
            } 
            else { 
                new Resolver().error(res, 'Invalid chat information.'); 
            } 
        } 
        catch(ex){
            console.log('Error[getMessages]' + ex);
            new Resolver().exception(res, 'Unexpected error.', ex);
        }
    }
}