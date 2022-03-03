import fs, { exists } from 'fs';
import process from "process";
import { Db } from '.';
const fsPromises = fs.promises;

export class MockDb {

    public static async createDb(dbName: string): Promise<boolean> {     
        const dbPath = './mockdb/'+dbName;
        if(!fs.existsSync(dbPath)) {
            await fsPromises.mkdir(dbPath, {recursive: true});
            return true;
        }
        throw Error(`database '${dbName}' doesn't exists`);
    }

    public static async removeDb(dbName: string): Promise<boolean> {
        const dbPath = './mockdb/'+dbName;
        if(fs.existsSync(dbPath)) {
            await fsPromises.rmdir(dbPath, {recursive: true});
            return true;
        }
        throw Error(`database '${dbName}' doesn't exists`);
    }

    public static exists(path:string): boolean {
        return fs.existsSync(path);
    }

    public static connect(dbName:string): Db {
        return new Db(dbName);
    }
}