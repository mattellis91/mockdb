import fs, { exists } from 'fs';
import { DbComponent } from "../db/dbComponent";
import {MockDb } from '../db/mockDb';
import { IInsertOneRepsonse, ITable } from "..";
import cuid from 'cuid';

export class Table extends DbComponent implements ITable {
    private _tableName:string;
    private _tablePath:string;
    constructor(dbName:string, dbPath:string, tableName:string) {
        super(dbName, dbPath);
        this._tableName = tableName;
        this._tablePath = this.dbPath + "/" + tableName + ".json";
    }
    
    public insertOne(record:Record<string, unknown>): IInsertOneRepsonse {
        const recordToInsert = {_id:cuid(), ...record}
        try {
            const tableContentsRaw = fs.readFileSync(this._tablePath);
            if(tableContentsRaw) {
                const tableContents = JSON.parse(tableContentsRaw as unknown as string) as Record<string, unknown>[];
                tableContents.unshift(recordToInsert);
                fs.writeFileSync(this._tablePath, JSON.stringify(tableContents));
                return {
                    dbName: this.dbName,
                    tableName: this._tableName,
                    insertSuccessfull: true,
                    record:recordToInsert
                }
            } else {
                return {
                    dbName: this.dbName,
                    tableName: this._tableName,
                    insertSuccessfull: false,
                    record:recordToInsert
                }
            }
        } catch(e) {
            return {
                dbName: this.dbName,
                tableName: this._tableName,
                insertSuccessfull: false,
                record:recordToInsert
            }
        }
    }
}