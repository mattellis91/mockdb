import fs, { exists } from 'fs';
import { DbComponent } from "../db/dbComponent";
import {MockDb } from '../db/mockDb';
import { ITable } from "..";

export class Table extends DbComponent implements ITable {
    private _tableName:string;
    constructor(dbName:string, dbPath:string, tableName:string) {
        super(dbName, dbPath);
        this._tableName = tableName;
    }
    
    public remove():boolean {
        const tablePath = this.dbPath+this._tableName+'.json';
        if(MockDb.exists(tablePath)) {
            fs.unlinkSync(tablePath);
            return true;
        } else {
            throw Error(`table '${this._tableName}' doesn't exists`);
        }
    }
}