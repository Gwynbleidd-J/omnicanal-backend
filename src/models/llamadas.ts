import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Llamadas{
    @PrimaryGeneratedColumn('increment')
    idTabla:Number;
    
    @Column({unique: true})
    idtabla:Number;

    @Column({type:"varchar"})
    nombre:string;

    @Column({type:"varchar"})
    apellido:string;

    @Column({type:"varchar"})
    trabajo:string;

    @Column({type:"varchar"})
    puesto:string;

    @Column({type:"varchar"})
    dato1:string;

    @Column({type:"varchar"})
    dato2:string;
}