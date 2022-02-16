import { IDB } from "..";
import fs, { exists } from 'fs';
import process from "process";
const fsPromises = fs.promises;

export class DB implements IDB {

    public async createDb(dbName: string): Promise<number> {     
        const dbPath = './mockdb/'+dbName;
        if(!fs.existsSync(dbPath)) {
            await fsPromises.mkdir(dbPath, {recursive: true});
            return 1;
        }
        return 0;
    }

    public async removeDb(dbName: string): Promise<number> {
        const dbPath = './mockdb/'+dbName;
        if(fs.existsSync(dbPath)) {
            await fsPromises.rmdir(dbPath, {recursive: true});
            return 1;
        }
        return 0;
    }
}