// import { OpeChats } from './chat';
import { Column, Entity, PrimaryGeneratedColumn, Table} from "typeorm";

@Entity()
export class CatNetworks{    
    @PrimaryGeneratedColumn('increment')   
    id:number; 

    @Column({type:'varchar', length: 250})
    name:String; 

    @Column({type:'varchar', length: 50}) 
    category:String;   
}