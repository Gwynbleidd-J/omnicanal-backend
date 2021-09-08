import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, Table, Timestamp, JoinColumn, OneToMany } from 'typeorm';
import { CatUsers } from './user';
import { CatComunicationStatuses } from './comunicationStatus';
import { CatAuxiliarStatuses } from './auxiliarStatus';
import { CatNetworks } from './network';

@Entity()
export class OpeCalls{
    @PrimaryGeneratedColumn('increment')
    id:number; 

    @Column({type:'date', default: () => `now()` })
    date:Date; 
    
    @Column({type:'time', default: () => `now()` })
    startTime:Timestamp;
    
    @Column({type:'time'})
    endingTime:Timestamp; 
    
    @Column({type:'integer'})
    score:number; 
    
    @Column({type:'varchar', length: 250})
    comments:String; 
    
    @Column({type:'varchar', length: 250})
    client:String; 
    
    @Column({type:'varchar', length: 250, nullable: true})
    clientPhoneNumber:String;
    
    @Column({type:'varchar', length: 250, nullable: true})
    file:String; 
    
    @Column({type:'integer'})
    userId:String; 
    
    @Column({type:'integer'})
    statusId:String; 

    @Column({type:'integer'})
    networkCategoryId:String;
    
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






