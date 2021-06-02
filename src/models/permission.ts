
import { Column, Entity, PrimaryGeneratedColumn, Table, ManyToMany, OneToMany, OneToOne, ManyToOne, JoinColumn} from "typeorm";
import { CatRols } from './rol';
import {CatMenus} from './menu';

@Entity()
export class CatPermissions{
    @PrimaryGeneratedColumn('increment')
    id:number;

    @Column({type:'varchar', length: 50})
    name:String;
    
    @Column({type:'varchar', length: 250})
    description:String;
    
    // @Column({ nullable: true })
    // rolId:number;

    @Column({ nullable: true })
    menuId:number;

    @Column({type:'varchar', length: 1, nullable: true})
    create:String;
    
    @Column({type:'varchar', length: 1, nullable: true})
    read:String;

    @Column({type:'varchar', length: 1, nullable: true})
    update:String;
    
    @Column({type:'varchar', length: 1, nullable: true})
    delete:String;

    @ManyToOne(() => CatRols, rol => rol.permission)
    @JoinColumn({name: 'rolId'})
    rol: CatRols;

    @ManyToOne(()=> CatMenus, menu => menu.permission)
    @JoinColumn({name: 'menuId'})
    menu: CatMenus

}
