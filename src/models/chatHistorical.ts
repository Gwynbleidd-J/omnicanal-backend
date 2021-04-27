import { Column, Entity, PrimaryGeneratedColumn, Table, Timestamp } from "typeorm";

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
}

 