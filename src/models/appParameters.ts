import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class CatAppParameters{
    @PrimaryGeneratedColumn('increment')
    id:number;

    @Column({type: 'varchar', length: 50 })
    twilioAccountSID:string

    @Column({type: 'varchar', length: 50 })
    twilioAuthToken:string

    @Column({type: 'varchar', length: 50 })
    whatsappAccount:string

    @Column({type: 'varchar', length: 50 })
    botTokenTelegram:string
}