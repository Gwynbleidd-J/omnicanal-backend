import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, Timestamp } from "typeorm";
import { CatUsers } from './user';
import { CatAuxiliarStatuses } from './auxiliarStatus';

@Entity()
export class OpeStatusTime{
    @PrimaryGeneratedColumn('increment')
    id:Number;

    @ManyToOne(() => CatUsers, user => user.ID)
    user: CatUsers

    @ManyToOne(() => CatAuxiliarStatuses, status => status.id)
    status: CatAuxiliarStatuses
   
    @Column({type:'time', nullable:true})
    startingTime:String;

    @Column({type:'time', nullable:true})
    endingTime:String;
}