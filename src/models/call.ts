import { Column, Entity, PrimaryGeneratedColumn, Table, Timestamp } from "typeorm";

@Entity()
export class OpeCalls{
    @PrimaryGeneratedColumn('increment')
    id:number; 

    @Column({type:'date', default: () => `now()` })
    date:Date; 
    
    @Column({type:'time', default: () => `now()` })
    startTime:Timestamp;
    
    @Column({type:'time'})
    endingTime:Timestamp; 
    
    @Column({type:'integer'})
    score:number; 
    
    @Column({type:'varchar', length: 250})
    comments:String; 
    
    @Column({type:'varchar', length: 250})
    client:String; 
    
    @Column({type:'varchar', length: 250, nullable: true})
    clientPhoneNumber:String;
    
    @Column({type:'varchar', length: 250, nullable: true})
    file:String; 
    
    @Column({type:'integer'})
    userId:String; 
    
    @Column({type:'integer'})
    statusId:String; 

    @Column({type:'integer'})
    networkCategoryId:String; 
    
}






