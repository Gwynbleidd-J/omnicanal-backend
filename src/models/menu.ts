import { Column, Entity, PrimaryGeneratedColumn, Table, OneToMany, OneToOne } from "typeorm";
import { CatPermissions } from './permission';
import { CatRols } from './rol';



@Entity()
export class CatMenus{
    @PrimaryGeneratedColumn('increment')
    id:number;

    @Column({type:'varchar', length: 50})
    name:String;
    
    @Column({type:'varchar', length: 250})
    description:String;
    
    @OneToMany(()=> CatPermissions, permission=> permission.menu)
    permission: CatPermissions[];
}