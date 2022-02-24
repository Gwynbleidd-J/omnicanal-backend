import { Column, Entity, OneToMany, PrimaryGeneratedColumn, Table, JoinColumn, OneToOne } from 'typeorm';
import  {CatUsers}  from './user';
import { OpeStatusTime } from './statusTime';

@Entity()
export class CatAuxiliarStatuses{
    @PrimaryGeneratedColumn('increment')
    id:number;

    @OneToMany(() => CatUsers, user => user.status)
    @JoinColumn({name: 'status'})
    user: CatUsers[]; 

    @OneToMany(() => OpeStatusTime, statusTime => statusTime.status)
    statusTime: OpeStatusTime[];

    @Column({type:'varchar', length: 50})
    status:String;
    
    @Column({type:'varchar', length: 100})
    description:String;
    


    

    /*
        @OneToMany(() => CatUsers, user => user.rol)
        user: CatUsers[]; 
    */
}
