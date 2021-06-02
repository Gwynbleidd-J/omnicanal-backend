import { Column, Entity, PrimaryGeneratedColumn, OneToMany, ManyToMany, OneToOne} from 'typeorm';
import {CatUsers} from './user';
import {CatPermissions} from './permission';

@Entity() 
export class CatRols{
@PrimaryGeneratedColumn('increment')
id:number;

@Column({type:'varchar', length: 50})
name:String;

@Column({type:'varchar', length: 250})
description:String;

@OneToMany(() => CatUsers, user => user.rol)
user: CatUsers[];

@OneToMany(() => CatPermissions, permission => permission.rol)
permission: CatPermissions[];

}

 








