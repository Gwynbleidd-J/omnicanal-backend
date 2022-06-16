import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, OneToOne, JoinColumn, OneToMany} from "typeorm";
import { CatAuxiliarStatuses } from "./auxiliarStatus";
import { CatSoftphoneParameters } from './softphoneParameters';
import { OpeChats } from './chat';
import { OpeCalls } from './call';
import{CatRols} from './rol'; 
import { OpeStatusTime } from "./statusTime";

@Entity()
export class CatUsers {
    @PrimaryGeneratedColumn('increment')
    ID:number;

    @Column({ type: 'varchar', length: 50 })
    name:String;

    @Column({ type: 'varchar', length: 50 })
    paternalSurname:String;

    @Column({ type: 'varchar', length: 50 })
    maternalSurname:String;

    @Column({ type: 'varchar', length: 50 })
    email:String;

    @Column()
    password:String;

    @Column({type:'varchar', length: 23, nullable: true})
    agentIdentifierWhatsapp:String; 

    @Column({type:'varchar', length: 10, nullable: true})
    agentIdentifierTelegram:String; 

    @Column({ default: 0 })
    activeChats:number;

    @Column({type:'varchar', length:70, nullable: true})
    activeIp:String;

    @Column({type:'varchar', length: 10, nullable: true})
    siglasUser:String;

    @Column({ nullable: true })
    rolID:number;

    @Column({ nullable: true })
    leaderId:number;

    @Column({ nullable: true })
    statusID:number;

    @Column({nullable:true, default: 0})
    activo:number;

/*     @Column({ nullable: true })
    credentialsId:number; */

    @ManyToOne(() => CatRols, rol => rol.user)
    @JoinColumn({name: 'rolID'})
    rol: CatRols;

    @ManyToOne(() => CatAuxiliarStatuses, status => status.user)
    @JoinColumn({name: 'statusID'})
    status: CatAuxiliarStatuses;
    
    @OneToOne(()=> CatSoftphoneParameters, credentials => credentials.user)
    @JoinColumn()
    credentials:CatSoftphoneParameters;
    
    @OneToMany(()=>OpeChats, chat =>chat.user)
    chat:OpeChats;
    
    @OneToMany(()=>OpeCalls, call =>call.user)
    call:OpeCalls;

    @OneToMany(() => OpeStatusTime, statusTime => statusTime.user)
    statusTime: OpeStatusTime[];

    @Column({ default: 2 })
    maxActiveChats:number;

        /*
        @Column({ nullable: true })
        rolID:number;

        @ManyToOne(() => CatRols, rol => rol.user)
        @JoinColumn({name: 'rolID'})
        rol: CatRols;

        @OneToMany(() => CatUsers, user => user.rol)
        user: CatUsers[];
    */


    /*
        @OneToMany(() => CatUsers, user => user.rol)
        user: CatUsers[]; 
    */


}