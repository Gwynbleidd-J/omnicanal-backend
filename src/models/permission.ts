import { Column, Entity, PrimaryGeneratedColumn, Table } from "typeorm";

@Entity()
export class CatPermissions{
    @PrimaryGeneratedColumn('increment')
    id:number;

    @Column({type:'varchar', length: 50})
    name:String;
    
    @Column({type:'varchar', length: 250})
    description:String;
    
    @Column({ nullable: true })
    rolId:number;

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

}
