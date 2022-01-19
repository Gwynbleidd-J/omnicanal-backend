import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, Table, Timestamp, JoinColumn, OneToMany } from 'typeorm';
import  {CatUsers}  from './user';
import { CatComunicationStatuses } from './comunicationStatus';
import { CatAuxiliarStatuses } from './auxiliarStatus';
import { CatNetworks } from './network';

@Entity()
export class OpeCalls{
    @PrimaryGeneratedColumn('increment')
    id:number; 

    @Column({type:'date', default: () => `now()` })
    date:Date; 
    
    @Column({type:'varchar', nullable:true }) //, default: () => `now()`, nullable:true
    startTime:String;
    
    @Column({type:'varchar', nullable: true}) //, default:() => `now()`, nullable: true
    endingTime:String; 
    
    @Column({type:'integer', nullable:true})
    score:number; 
    
    @Column({type:'varchar', length: 250, nullable:true})
    comments:String; 
    
    @Column({type:'varchar', length: 250, nullable:true})
    client:String; 
    
    @Column({type:'varchar', length: 250, nullable: true})
    clientPhoneNumber:String;
    
    @Column({type:'varchar', length: 250, nullable: true})
    file:String; 
    
    @Column({type:'integer'})
    userId:Number; 
    
    @Column({type:'integer'})
    statusId:Number; 

    @Column({type: 'varchar', nullable: true})
    tipoLlamada: String

    @Column({type:'integer', nullable:true})
    networkCategoryId:Number;
    
    @ManyToOne(() => CatUsers, user => user.call)
    @JoinColumn({name: 'userId'})
    user: CatUsers; 

    @ManyToOne(() => CatComunicationStatuses, status => status.call)
    @JoinColumn({name: 'statusId'})
    status: CatComunicationStatuses;

    @ManyToOne(() => CatNetworks, network => network.call)
    @JoinColumn({name: 'networkCategoryId'})
    network: CatNetworks;

        /*
        @Column({ nullable: true })
        rolID:number;

        @ManyToOne(() => CatRols, rol => rol.user)
        @JoinColumn({name: 'rolID'})
        rol: CatRols;

        @OneToMany(() => CatUsers, user => user.rol)
        user: CatUsers[];
    */
}






