import { IDB } from "..";
import fs from 'fs';
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
}