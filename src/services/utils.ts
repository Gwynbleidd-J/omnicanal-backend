import { getManager } from "typeorm";

export class Utils {
    public async encrypt(password:string): Promise<string> {
        let manager = getManager();
        let pass = await manager.query(`SELECT MD5('${password}')`);

        return pass[0].md5;
    }
}
