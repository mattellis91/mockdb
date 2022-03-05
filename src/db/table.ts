import fs from 'fs';
import { DbComponent } from "../db/dbComponent";
import cuid from 'cuid';
import { MockDb } from './mockDb';
import { ITable, ITableResponse } from '../interfaces';
import { Responses } from './responses';
import { cloneDeep } from 'lodash';
import {Parser} from 'node-sql-parser';
import * as util from 'util';
import { QueryHelper } from '../query/queryHelper';

export class Table extends DbComponent implements ITable {
    private _tableName:string;
    private _tablePath:string;
    private _count:number;
    private _queryHelper:QueryHelper;
    constructor(dbName:string, dbPath:string, tableName:string, newTable:boolean) {
        super(dbName, dbPath);
        this._tableName = tableName;
        this._tablePath = this.getFullTablePath(tableName);
        this._queryHelper = new QueryHelper();
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
    
    public insertOne(record:Record<string, unknown>): ITableResponse {
        const recordToInsert = {_id:cuid(), ...record}
        const response:ITableResponse = this.getInitialResponse();
        try {
            const tableContentsRaw = fs.readFileSync(this._tablePath);
            if(tableContentsRaw) {
                const tableContents = JSON.parse(tableContentsRaw as unknown as string) as Record<string, unknown>[];
                tableContents.unshift(recordToInsert);
                fs.writeFileSync(this._tablePath, JSON.stringify(tableContents));
                this._count++;
                response.status = Responses.SUCCESS;
                response.data = [recordToInsert];
                return response
            } else {
                response.errors.push(new Error('Error reading contents of table'));
                return response;
            }
        } catch(e) {
            response.errors.push(e as Error);
            return response;
        }
    }

    public insertMany(records:Record<string, unknown>[]): ITableResponse {
        const recordsToInsert = records.map((record) => {return {_id:cuid(), ...record}});
        const response:ITableResponse = this.getInitialResponse();
        try {
            const tableContentsRaw = fs.readFileSync(this._tablePath);
            if(tableContentsRaw) {
                const tableContents = JSON.parse(tableContentsRaw as unknown as string) as Record<string, unknown>[];
                tableContents.concat(recordsToInsert);
                fs.writeFileSync(this._tablePath, JSON.stringify(tableContents));
                this._count+=records.length;
                response.status = Responses.SUCCESS;
                response.data = recordsToInsert;
                return response;
            } else {
                response.errors.push(new Error('Error reading contents of table'));
                return response;
            }
        } catch(e) {
            response.errors.push(e as Error);
            return response;
        }
    }

    public retrieveRecordById(id:string) : ITableResponse {
        const response:ITableResponse = this.getInitialResponse();
        try {
            const tableContentsRaw = fs.readFileSync(this._tablePath);
            if(tableContentsRaw) {
                const tableContents = JSON.parse(tableContentsRaw as unknown as string) as Record<string, unknown>[]; 
                const foundItem = tableContents.find((record) => record._id === id);
                if(foundItem) {
                    response.status = Responses.SUCCESS;
                    response.data = [foundItem];
                    return response;
                } else {
                    response.errors.push(new Error(`Could not find it with id '${id}' in table '${this._tableName}'`));
                    return response;
                }
            } else {
                response.errors.push(new Error('Error reading contents of table'));
                return response;
            }
        } catch(e) {
            response.errors.push(e as Error);
            return response;
        }
    };

    //TODO: implement this
    public retrieveRecords(query:string) {
        const sqlParser = new Parser();
        query = query.trim();
        if(query.toLowerCase().startsWith('where')) {
            console.log(`SELECT * from ${this._tableName} ` + query);
            const queryAST = sqlParser.parse(`SELECT * FROM ${this._tableName} ` + query);
            console.log(util.inspect(queryAST, {showHidden: false, depth: null, colors: true}))
        } else {
            throw Error();
        }
    }

    public updateRecordById(id:string, recordData:Record<string, unknown>) : ITableResponse {
        const response:ITableResponse = this.getInitialResponse();
        try {
            const tableContentsRaw = fs.readFileSync(this._tablePath);
            if(tableContentsRaw) {
                const tableContents = JSON.parse(tableContentsRaw as unknown as string) as Record<string, unknown>[];
                const foundRecordIndex = tableContents.findIndex((record) => record._id === id);
                if(foundRecordIndex > -1) {
                    const newRecord = {...tableContents[foundRecordIndex], ...recordData};
                    tableContents[foundRecordIndex] = newRecord;
                    fs.writeFileSync(this._tablePath, JSON.stringify(tableContents));
                    response.status = Responses.SUCCESS;
                    response.data = [tableContents[foundRecordIndex]];
                    return response;
                } else {
                    response.errors.push(new Error(`Could not find it with id '${id}' in table '${this._tableName}'`));
                    return response;
                }
            } else {
                response.errors.push(new Error('Error reading contents of table'));
                return response;
            }
        } catch (e) {
            response.errors.push(e as Error);
            return response;
        }
    }

    public removeRecord(id:string): ITableResponse {
        const response:ITableResponse = this.getInitialResponse();
        try {
            const tableContentsRaw = fs.readFileSync(this._tablePath);
            if(tableContentsRaw) {
                const tableContents = JSON.parse(tableContentsRaw as unknown as string) as Record<string, unknown>[];
                const foundRecordIndex = tableContents.findIndex((record) => record._id === id);
                if(foundRecordIndex > -1) {
                    const recordCopy = cloneDeep(tableContents[foundRecordIndex]);
                    tableContents.splice(foundRecordIndex, 1);
                    fs.writeFileSync(this._tablePath, JSON.stringify(tableContents));
                    this._count--;
                    response.status = Responses.SUCCESS;
                    response.data = [recordCopy];
                    return response;
                }
                response.errors.push(new Error(`Could not find it with id '${id}' in table '${this._tableName}'`));
                return response;
            }
            response.errors.push(new Error('Error reading contents of table'));
            return response;
        } catch(e) {
            response.errors.push(e as Error);
            return response;
        }
    }

    public count():number {
        return this._count;
    }

    public getName():string {
        return this._tableName;
    }

    public rename(newName:string):boolean {
        try {
            const newNamePath = this.getFullTablePath(newName);
            if(MockDb.exists(newNamePath)) {
                return false;
            }
            fs.renameSync(this.getFullTablePath(this._tableName), newNamePath);
            this._tableName = newName;
            this._tablePath = this.getFullTablePath(newName);
            return true;
        } catch(e) {
            return false;
        }
    }

    private getInitialResponse(): ITableResponse {
        return {
            dbName: this.dbName, 
            tableName: this._tableName, 
            status:Responses.ERROR, 
            data:[],
            errors:[]
        };
    }

    private getFullTablePath(tableName:string):string {
        return `${this.dbPath}/${tableName}.json`;
    } 

    
}