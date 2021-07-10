// import { OpeChats } from './chat';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn, Table} from "typeorm"
import { OpeCalls } from './call';
import { OpeChats } from "./chat";

@Entity()
export class CatNetworks{    
    @PrimaryGeneratedColumn('increment')   
    id:number; 

    @Column({type:'varchar', length: 250})
    name:String; 

    @Column({type:'varchar', length: 50}) 
    category:String;
    
    @OneToMany(() => OpeChats, chat => chat.network)
    chat: OpeChats[];

    @OneToMany(()=> OpeCalls, call => call.network)
    call:OpeCalls[];
    /*
        @OneToMany(() => CatUsers, user => user.rol)
        user: CatUsers[]; 
    */
}