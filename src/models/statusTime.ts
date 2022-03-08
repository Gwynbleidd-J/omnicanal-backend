import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, JoinColumn, Timestamp } from "typeorm";
import { CatUsers } from './user';
import { CatAuxiliarStatuses } from './auxiliarStatus';

@Entity()
export class OpeStatusTime{
    @PrimaryGeneratedColumn('increment')
    id:Number;

    @Column({type:'integer', nullable: true})
    userId:number; 

    @Column({type:'integer', nullable: true})
    statusId:number; 

    @ManyToOne(() => CatUsers, user => user.statusTime)
    @JoinColumn({name: 'userId'})
    user:CatUsers

    @ManyToOne(() => CatAuxiliarStatuses, status => status.id)
    @JoinColumn({name: 'statusId'})
    status: CatAuxiliarStatuses

    @Column({type:'date', default: () => `now()` })
    date:Date; 
   
    @Column({type:'time', nullable:true})
    startingTime:String;

    @Column({type:'time', nullable:true})
    endingTime:String;
}