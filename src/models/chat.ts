import { Column, Entity, PrimaryGeneratedColumn, Table, Timestamp } from "typeorm";

@Entity()
export class OpeChats{
    @PrimaryGeneratedColumn('increment')
    id:number; 

    @Column({type:'date'})
    date:Date; 
    
    @Column({type:'time'})
    startTime:Timestamp;
    
    @Column({type:'time'})
    endingTime:Timestamp; 
    
    @Column({type:'integer'})
    score:number; 
    
    @Column({type:'varchar', length: 250})
    comments:String; 
    
    @Column({type:'varchar', length: 250})
    client:String; 

    @Column({type:'varchar', length: 250})
    from:String;

    @Column({type:'char', length: 250})
    platformIdentifier:String; 
    
    @Column({type:'varchar', length: 250})
    file:String; 
    
    @Column({type:'integer'})
    userId:String; 
    
    @Column({type:'integer'})
    statusId:String; 

    @Column({type:'integer'})
    networkCategoryId:String; 
    
}

 