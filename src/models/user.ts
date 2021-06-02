import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, OneToOne, JoinColumn} from "typeorm";
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

    @Column({})
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
    statusID:number;

    @Column({ nullable: true })
    leaderId:number;
    
    @ManyToOne(() => CatRols, rol => rol.user)
    @JoinColumn({name: 'rolID'})
    rol: CatRols;
   
}