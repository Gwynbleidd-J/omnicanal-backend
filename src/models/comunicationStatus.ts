import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, Table } from "typeorm";
import { OpeCalls } from './call';
import { OpeChats } from './chat';
import { OpeChatHistoric } from './chatHistorical';

@Entity()
export class CatComunicationStatuses{
    @PrimaryGeneratedColumn('increment')
    id:number;

    @Column({type:'varchar', length: 50})
    status:String;
    
    @Column({type:'varchar', length: 100})
    description:String;

    @OneToMany(() => OpeChats, chat => chat.status)
    chat: OpeChats[];

    @OneToMany(() => OpeCalls, call => call.status)
    call: OpeCalls[];

    @OneToMany(() => OpeChatHistoric, historic => historic.status)
    historic: OpeChatHistoric[];
     
    /*
    @OneToMany(() => CatUsers, user => user.rol)
    user: CatUsers[]; 
    */
}