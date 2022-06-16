import fs from "fs";

export class Logger {
    private entity:String;

    constructor(entity:String) {
        this.entity = entity;
    }

    private getDate(): String {
        let date = new Date();
        let year, month, day;
        
        year = date.getFullYear();
        month = date.getMonth() + 1;
        month = month.length>1?month:`0${month}`;
        day = date.getDate().toString();
        day = day.length>1?day:`0${day}`;

        return `${year}${month}${day}`;
    }

    private getTime(): String {
        let date = new Date();
        let hours, minutes, seconds;
        
        hours = date.getHours().toString();
        hours = hours.length>1?hours:`0${hours}`;
        minutes = date.getMinutes().toString();
        minutes = minutes.length>1?minutes:`0${minutes}`;
        seconds = date.getSeconds().toString();
        seconds = seconds.length>1?seconds:`0${seconds}`;

        return `${hours}:${minutes}:${seconds}`;
    }

    public async info(message): Promise<void> {
        console.info(message);
        if(!fs.existsSync('logs')) fs.mkdir('logs', () => {});
        fs.appendFile('logs/log_' + this.getDate() + '.txt', `[${this.getTime()}][${this.entity}][Info]: ${message}\n`, () => {});
    }

    public async error(message): Promise<void> {
        console.error(message);
        if(!fs.existsSync('logs')) fs.mkdir('logs', () => {});
        fs.appendFile('logs/log_' + this.getDate() + '.txt', `[${this.getTime()}][${this.entity}][Error]: ${message}\n`, () => {});
    }
}