import { Column, Entity, PrimaryGeneratedColumn, Table } from "typeorm";

@Entity()
export class CatUsers {
    @PrimaryGeneratedColumn('increment')
    ID:number;

    @Column({ type: 'varchar', length: 50 })
    name:String;

    @Column({ type: 'varchar', length: 50 })
    paternalSurname:String;

    @Column({ type: 'varchar', length: 50 })
    maternalSurname:String;

    @Column({ type: 'varchar', length: 50 })
    email:String;

    @Column({})
    password:String;

    @Column({ default: 0 })
    activeChats:number;

    @Column({ nullable: true })
    rolID:number;

    @Column({ nullable: true })
    statusID:number;
}