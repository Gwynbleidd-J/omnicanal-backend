import { Column, Entity, PrimaryGeneratedColumn, Table } from "typeorm";

@Entity()
export class CatNetworkCategories{ 
    @PrimaryGeneratedColumn('increment') 
    id:number; 

    @Column({type:'varchar', length: 50}) 
    category:String; 
    
    @Column({type:'varchar', length: 250})
    description:String;
    
}