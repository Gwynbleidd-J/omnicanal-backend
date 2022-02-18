import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Table, Timestamp } from "typeorm";
import { CatComunicationStatuses } from './comunicationStatus';
import { OpeChats } from './chat';

@Entity()
export class OpeChatHistoric{
    @PrimaryGeneratedColumn('increment')
    id:number; 

    @Column({type:'varchar', length: 50, nullable: true})
    messagePlatformId:String; 
    
    @Column({type:'time', default: () => `now()` })
    time:Timestamp;
       
    @Column({type:'varchar', nullable: true})
    text:String; 
    
    @Column({type:'char', length: 1, nullable: true})
    transmitter:String; 
 
    @Column({type:'integer', nullable: true})
    statusId:number;  

    @Column({type:'integer', nullable: true})
    chatId:number;

    @Column({type: 'varchar', nullable:true})
    messageType:String
    
    @Column({type: 'varchar', nullable:true})
    mediaUrl:String

    @ManyToOne(() => CatComunicationStatuses, status => status.historic)
    @JoinColumn({name: 'statusId'})
    status:CatComunicationStatuses;

    @ManyToOne(() => OpeChats, chat => chat.historic)
    @JoinColumn({name: 'chatId'})
    chat:OpeChats; 


    
    /*
        @Column({ nullable: true })
        rolID:number;
    
        @ManyToOne(() => CatRols, rol => rol.user)
        @JoinColumn({name: 'rolID'})
        rol: CatRols;
    
        @OneToMany(() => CatUsers, user => user.rol)
        user: CatUsers[];
    */


}

 