import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, OneToOne, JoinColumn, OneToMany} from "typeorm";
import { CatAuxiliarStatuses } from "./auxiliarStatus";
import { CatSoftphoneCredentials } from './softphoneCredentials';
import{CatRols} from './rol'; 

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

    @Column({type:'varchar', length:15, nullable: true})
    activeIp:String;

    @Column({ nullable: true })
    rolID:number;

    
    @Column({ nullable: true })
    leaderId:number;

    @Column({default: 0})
    solvedChats:number;
    
    @ManyToOne(() => CatRols, rol => rol.user)
    @JoinColumn({name: 'rolID'})
    rol: CatRols;

    @ManyToOne(() => CatAuxiliarStatuses, status => status.id)
    @JoinColumn({name: 'statusID'})
    status: CatAuxiliarStatuses;
    
    @OneToOne(()=> CatSoftphoneCredentials, credentials => credentials.id)
    @JoinColumn({name: 'credentialsId'})
    credentialsSoftphone:CatSoftphoneCredentials;
}