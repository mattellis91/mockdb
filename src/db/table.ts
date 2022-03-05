import fs, { exists } from 'fs';
import { DbComponent } from "../db/dbComponent";
import { IInsertOneRepsonse, ITable } from "..";
import cuid from 'cuid';
import { MockDb } from './mockDb';

export class Table extends DbComponent implements ITable {
    private _tableName:string;
    private _tablePath:string;
    private _count:number;
    constructor(dbName:string, dbPath:string, tableName:string, newTable:boolean) {
        super(dbName, dbPath);
        this._tableName = tableName;
        this._tablePath = this.getFullTablePath(tableName);
        if(newTable) {
            this._count = 0;
        } else {
            try {
                const tableContentsRaw = fs.readFileSync(this._tablePath);
                if(tableContentsRaw) {
                    this._count = (JSON.parse(tableContentsRaw as unknown as string) as Record<string, unknown>[]).length;
                } else {
                    this._count = -1;
                }
            } catch (e) {
                this._count = -1;
            }
        }
    }
    
    public insertOne(record:Record<string, unknown>): IInsertOneRepsonse {
        const recordToInsert = {_id:cuid(), ...record}
        try {
            const tableContentsRaw = fs.readFileSync(this._tablePath);
            if(tableContentsRaw) {
                const tableContents = JSON.parse(tableContentsRaw as unknown as string) as Record<string, unknown>[];
                tableContents.unshift(recordToInsert);
                fs.writeFileSync(this._tablePath, JSON.stringify(tableContents));
                this._count++;
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

    public retrieveRecordById(id:string) : Record<string, unknown> | undefined {
        try {
            const tableContentsRaw = fs.readFileSync(this._tablePath);
            if(tableContentsRaw) {
                const tableContents = JSON.parse(tableContentsRaw as unknown as string) as Record<string, unknown>[];
                return tableContents.find((record) => record._id === id);
            }
            return undefined;
        } catch(e) {
            return undefined;
        }
    };

    public updateRecordById(id:string, recordData:Record<string, unknown>) : Record<string, unknown> | undefined {
        try {
            const tableContentsRaw = fs.readFileSync(this._tablePath);
            if(tableContentsRaw) {
                const tableContents = JSON.parse(tableContentsRaw as unknown as string) as Record<string, unknown>[];
                const foundRecordIndex = tableContents.findIndex((record) => record._id === id);
                if(foundRecordIndex > -1) {
                    const newRecord = {...tableContents[foundRecordIndex], ...recordData};
                    tableContents[foundRecordIndex] = newRecord;
                    fs.writeFileSync(this._tablePath, JSON.stringify(tableContents));
                    return newRecord;
                }
                return undefined;
            }
        } catch (e) {
            return undefined;
        }
    }

    public removeRecord(id:string): boolean {
        try {
            const tableContentsRaw = fs.readFileSync(this._tablePath);
            if(tableContentsRaw) {
                const tableContents = JSON.parse(tableContentsRaw as unknown as string) as Record<string, unknown>[];
                const foundRecordIndex = tableContents.findIndex((record) => record._id === id);
                if(foundRecordIndex > -1) {
                    tableContents.splice(foundRecordIndex, 1);
                    fs.writeFileSync(this._tablePath, JSON.stringify(tableContents));
                    this._count--;
                    return true;
                }
                return false;
            }
            return false;
        } catch(e) {
            return false;
        }
    }

    public count():number {
        return this._count;
    }

    public getName():string {
        return this._tableName;
    }

    private getFullTablePath(tableName:string):string {
        return `${this.dbPath}/${tableName}.json`;
    } 

    public rename(newName:string):boolean {
        try {
            const newNamePath = this.getFullTablePath(newName);
            if(MockDb.exists(newNamePath)) {
                return false;
            }
            fs.renameSync(this.getFullTablePath(this._tableName), newNamePath);
            this._tableName = newName;
            return true;
        } catch(e) {
            return false;
        }
    }
}