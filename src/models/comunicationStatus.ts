import { Column, Entity, PrimaryGeneratedColumn, Table } from "typeorm";

@Entity()
export class CatComunicationStatuses{
    @PrimaryGeneratedColumn('increment')
    id:number;

    @Column({type:'varchar', length: 50})
    status:String;
    
    @Column({type:'varchar', length: 100})
    description:String;
    
}