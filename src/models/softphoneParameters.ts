import { Column, Entity, OneToOne, PrimaryGeneratedColumn, Table,  } from "typeorm";
import {CatUsers}  from "./user";

@Entity()
export class CatSoftphoneParameters{
    @PrimaryGeneratedColumn('increment')
    id:number;

    @Column({type:'varchar', length: 50})
    userName:string;

    @Column({type:'varchar', length: 50})
    password:string

    @Column({type:'varchar', length: 50})
    domain:string

    @Column({type:'varchar', length: 50})
    displayName:string;
    
    @Column({type:'varchar', length: 50})
    authName:string

    @Column({type: 'varchar', length: 50})
    server:string;

    @Column({type:'integer'})
    port:number;

    @OneToOne(()=> CatUsers, user => user.credentials)
    user:CatUsers;

}