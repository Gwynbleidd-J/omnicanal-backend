import { Column, Entity, PrimaryGeneratedColumn, Table, Timestamp, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { CatUsers } from './user';
import { CatComunicationStatuses } from './comunicationStatus';
import { CatNetworks } from './network';
import { OpeChatHistoric } from './chatHistorical';

@Entity()
export class OpeChats{
    @PrimaryGeneratedColumn('increment')
    id:number; 

    @Column({type:'date', default: () => `now()` })
    date:Date; 
    
    @Column({type:'time', default: () => `now()` })
    startTime:Timestamp;
    
    @Column({type:'time', nullable: true})
    endingTime:Timestamp; 
    
    @Column({type:'integer', nullable: true})
    score:number; 
    
    @Column({type:'varchar', length: 250})
    comments:String; 
    
    @Column({type:'varchar', length: 250})
    clientPlatformIdentifier:String; 

    @Column({type:'varchar', length: 250, nullable: true})
    clientPhoneNumber:String;

    @Column({type:'char', length: 1})
    platformIdentifier:String; 
    
    @Column({type:'varchar', length: 250, nullable: true})
    file:String; 
    
    @Column({type:'integer', nullable: true})
    userId:number;
    
    @Column({type:'integer', nullable: true})
    statusId:number; 

    @Column({type:'integer', nullable: true})
    networkCategoryId:String; 

    @ManyToOne(()=> CatUsers, user => user.chat)
    @JoinColumn({name: 'userId'})
    user:CatUsers;
 
    @ManyToOne(() => CatComunicationStatuses, status => status.chat)
    @JoinColumn({name: 'statusId'})
    status:CatComunicationStatuses;
    
    @ManyToOne(() => CatNetworks, network => network.chat)
    @JoinColumn({name: 'networkCategoryId'})
    network: CatNetworks;

    @OneToMany(() => OpeChatHistoric, historic => historic.chat)
    historic: OpeChatHistoric;

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

 