import { Column, Entity, PrimaryGeneratedColumn, Table,  } from "typeorm";

@Entity()
export class CatSoftphoneCredentials{




    @PrimaryGeneratedColumn('increment')
    id:number;

    @Column({type:'bool'})
    requiredRegister:boolean;
    
    @Column({type:'varchar', length: 50})
    displayName:string;

    @Column({type:'varchar', length: 50})
    userName:string;

    @Column({type:'varchar', length: 50})
    registerName:string

    @Column({type:'varchar', length: 50})
    password:string

    @Column({type:'varchar', length: 50})
    domain:string

    @Column({type:'integer'})
    port:number

    @Column({type:'varchar', length: 50})
    proxy:string
}