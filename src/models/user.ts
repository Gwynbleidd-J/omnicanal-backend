import { Column, Entity, PrimaryGeneratedColumn, Table } from "typeorm";

@Entity()
export class User {
    @PrimaryGeneratedColumn('increment')
    idUser:String;

    @Column({ type: 'varchar', length: 100 })
    userName:String;

    @Column()
    email:String;

    @Column()
    password:String;
}