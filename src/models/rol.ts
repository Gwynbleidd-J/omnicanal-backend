import { Column, Entity, PrimaryGeneratedColumn, Table } from 'typeorm';

@Entity() 
export class CatRols{
@PrimaryGeneratedColumn('increment')
id:number;

@Column({type:'varchar', length: 50})
name:String;

@Column({type:'varchar', length: 250})
description:String;
 
}


















