import { Column, Entity, OneToOne, PrimaryGeneratedColumn, Table,  } from "typeorm";
import { CatRols } from "./rol";
import { CatUsers } from "./user";

@Entity()
export class CatSoftphoneCredentials{
    @PrimaryGeneratedColumn('increment')
    id:number;

    @Column({type:'bool'})
    requiredRegister:boolean;
    
    @Column({type:'varchar', length: 50, nullable: true})
    displayName:string;

    @Column({type:'varchar', length: 50})
    userName:string;

    @Column({type:'varchar', length: 50})
    registerName:string

    @Column({type:'varchar', length: 50})
    password:string

    @Column({type:'varchar', length: 50})
    domain:string

    @Column({type:'integer', nullable: true})
    port:number

    @Column({type:'varchar', length: 50})
    proxy:string

    @OneToOne(()=> CatUsers, user => user.credentials)
    user:CatUsers;

}