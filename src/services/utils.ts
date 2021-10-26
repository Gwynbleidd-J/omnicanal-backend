import { getManager } from "typeorm";
import { getRepository } from "typeorm";
import { CatAppParameters } from "../models/appParameters";
import { Telegraf } from "telegraf";

export class Utils {
    public async encrypt(password:string): Promise<string> {
        let manager = getManager();
        let pass = await manager.query(`SELECT MD5('${password}')`);

        return pass[0].md5;
    }


}
