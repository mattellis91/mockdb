import { DbComponent, MockDb, Table } from ".";
import { IDB } from "..";
import fs, { exists } from 'fs';

export class Db implements IDB {
    protected dbName:string;
    protected dbPath:string ;
    protected tables:string[] | undefined;
    
    constructor(dbName:string) {
        const dbPath = './mockdb/'+dbName;
        if(!MockDb.exists(dbPath)) {
            (async () => {
                await MockDb.createDb(dbName);
            })();
        }
        this.dbName = dbName;
        this.dbPath = dbPath
        this.tables = [];
    }

    public table(tableName:string):Table {
        const tablePath = this.getFullTablePath(tableName);
        const fileContents = `[]`;
        if(!MockDb.exists(tablePath)) {
            fs.writeFileSync(tablePath, fileContents);
            return new Table(this.dbName, this.dbPath, tableName, true);
        } else {
            return new Table(this.dbName, this.dbPath, tableName, false);
        }
    }

    public dropTable(tableName:string):boolean {
        const tablePath = this.getFullTablePath(tableName);
        if(!MockDb.exists(tablePath)) {
            return false;
        }
        fs.unlinkSync(tablePath);
        return true;
    }

    public listTables():string[] {
        const tableNames:string[] = [];
        fs.readdirSync(this.dbPath).forEach(table => {
            tableNames.push(MockDb.removeExtensionFromFileName(table));
        });
        return tableNames;
    }

    private getFullTablePath(tableName:string):string {
        return `${this.dbPath}/${tableName}.json`;
    } 
}