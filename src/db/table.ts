import fs, { exists } from 'fs';
import { Db, MockDb } from ".";
import { ITable } from "..";

export class Table extends Db implements ITable {
    public createTable(tableName: string): boolean {
        const tablePath = this.dbPath+tableName+'.json';
        const fileContents = `[]`;
        if(!MockDb.exists(tablePath)) {
            fs.writeFileSync(tablePath, fileContents);
            return true;
        } else {
            throw Error(`table '${tableName}' already exists`);
        }
    }

    public removeTable(tableName: string):boolean {
        const tablePath = this.dbPath+tableName+'.json';
        if(MockDb.exists(tablePath)) {
            fs.unlinkSync(tablePath);
            return true;
        } else {
            throw Error(`table '${tableName}' doesn't exists`);
        }
    }
}