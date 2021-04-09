import { Column, Entity, PrimaryGeneratedColumn, Table, Timestamp } from "typeorm";

@Entity()
export class OpeChats{
    @PrimaryGeneratedColumn('increment')
    id:number; 

    @Column({type:'date', default: () => `now()` })
    date:Date; 
    
    @Column({type:'time', default: () => `now()` })
    startTime:Timestamp;
    
    @Column({type:'time', nullable: true})
    endingTime:Timestamp; 
    
    @Column({type:'integer', nullable: true})
    score:number; 
    
    @Column({type:'varchar', length: 250})
    comments:String; 
    
    @Column({type:'varchar', length: 250})
    clientPlatformIdentifier:String; 

    @Column({type:'varchar', length: 250, nullable: true})
    clientPhoneNumber:String;

    @Column({type:'char', length: 1})
    platformIdentifier:String; 
    
    @Column({type:'varchar', length: 250, nullable: true})
    file:String; 
    
    @Column({type:'integer', nullable: true})
    userId:String; 
    
    @Column({type:'integer', nullable: true})
    statusId:number; 

    @Column({type:'integer', nullable: true})
    networkCategoryId:String; 
    
}

 