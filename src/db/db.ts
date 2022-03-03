import { MockDb } from ".";
import { IDB } from "..";

export class Db implements IDB {
    protected dbName:string | undefined;
    protected dbPath:string | undefined;
    protected tables:string[] | undefined;

    constructor(dbName:string) {
        const dbPath = './mockdb/'+dbName;
        if(MockDb.exists(dbPath)) {
            this.dbName = dbName;
            this.dbPath = dbPath
            this.tables = [];
        } else {
            (async () => {
                await MockDb.createDb(dbName);
                this.dbName = dbName;
                this.dbPath = dbPath
                this.tables = [];
            })();
        }
    }
}