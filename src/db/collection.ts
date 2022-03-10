import fs from 'fs';
import { DbComponent } from "./dbComponent";
import cuid from 'cuid';
import { MockDb } from './mockDb';
import { ICollection, ICollectionResponse } from '../interfaces';
import { Responses } from './responses';
import { cloneDeep } from 'lodash';
import {AST, Parser} from 'node-sql-parser';
import * as util from 'util';
import { FilterHelper } from '../filter/filterHelper';

export class Collection extends DbComponent implements ICollection {
    private _collectionName:string;
    private _collectionPath:string;
    private _count:number;
    private _filterHelper:FilterHelper;
    constructor(dbName:string, dbPath:string, tableName:string, newTable:boolean) {
        super(dbName, dbPath);
        this._collectionName = tableName;
        this._collectionPath = this.getFullTablePath(tableName);
        this._filterHelper = new FilterHelper();
        if(newTable) {
            this._count = 0;
        } else {
            try {
                const tableContentsRaw = fs.readFileSync(this._collectionPath);
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
    
    public insertOne(record:Record<string, unknown>): ICollectionResponse {
        const recordToInsert = {_id:cuid(), ...record}
        const response:ICollectionResponse = this.getInitialResponse();
        try {
            const tableContentsRaw = fs.readFileSync(this._collectionPath);
            if(tableContentsRaw) {
                const tableContents = JSON.parse(tableContentsRaw as unknown as string) as Record<string, unknown>[];
                tableContents.unshift(recordToInsert);
                fs.writeFileSync(this._collectionPath, JSON.stringify(tableContents));
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

    public insertMany(records:Record<string, unknown>[]): ICollectionResponse {
        const recordsToInsert = records.map((record) => {return {_id:cuid(), ...record}});
        const response:ICollectionResponse = this.getInitialResponse();
        try {
            const tableContentsRaw = fs.readFileSync(this._collectionPath);
            if(tableContentsRaw) {
                const tableContents = JSON.parse(tableContentsRaw as unknown as string) as Record<string, unknown>[];
                const newTableContents = tableContents.concat(recordsToInsert);
                fs.writeFileSync(this._collectionPath, JSON.stringify(newTableContents));
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

    public retrieveRecordById(id:string) : ICollectionResponse {
        const response:ICollectionResponse = this.getInitialResponse();
        try {
            const tableContentsRaw = fs.readFileSync(this._collectionPath);
            if(tableContentsRaw) {
                const tableContents = JSON.parse(tableContentsRaw as unknown as string) as Record<string, unknown>[]; 
                const foundItem = tableContents.find((record) => record._id === id);
                if(foundItem) {
                    response.status = Responses.SUCCESS;
                    response.data = [foundItem];
                    return response;
                } else {
                    response.errors.push(new Error(`Could not find it with id '${id}' in table '${this._collectionName}'`));
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

    public retrieveRecords(query?:string): ICollectionResponse {
        const response = this.getInitialResponse();
        if(query){
            const sqlParser = new Parser();
            query = query.trim();
            if(query.toLowerCase().startsWith('where')) {
                try{
                    const queryAST = sqlParser.parse(`SELECT * FROM ${this._collectionName} ` + query);
                    const tableContentsRaw = fs.readFileSync(this._collectionPath);
                    if(tableContentsRaw) {
                        const tableContents = JSON.parse(tableContentsRaw as unknown as string) as Record<string, unknown>[]; 
                        //this._queryHelper.filterTableContents(tableContents, (queryAST.ast as unknown as Record<string, Record<string, unknown>>).where)
                        response.status = Responses.SUCCESS;
                        return response;
                    } else {
                        response.errors.push(new Error('Error reading contents of table'));
                        return response;
                    }
                } catch (e) {
                    response.errors.push(e as Error);
                    return response;
                }
            } else {
                response.errors.push(new Error("retrieval query must start with 'WHERE' keyword"));
                return response;
            }
        } else { //retrieve all records if no query given
            const tableContentsRaw = fs.readFileSync(this._collectionPath);
            if(tableContentsRaw) {
                const tableContents = JSON.parse(tableContentsRaw as unknown as string) as Record<string, unknown>[]; 
                response.status = Responses.SUCCESS;
                response.data = tableContents;
                return response;
            } else {
                response.errors.push(new Error('Error reading contents of table'));
                return response;
            }
        }
    }

    public updateRecordById(id:string, recordData:Record<string, unknown>) : ICollectionResponse {
        const response:ICollectionResponse = this.getInitialResponse();
        try {
            const tableContentsRaw = fs.readFileSync(this._collectionPath);
            if(tableContentsRaw) {
                const tableContents = JSON.parse(tableContentsRaw as unknown as string) as Record<string, unknown>[];
                const foundRecordIndex = tableContents.findIndex((record) => record._id === id);
                if(foundRecordIndex > -1) {
                    const newRecord = {...tableContents[foundRecordIndex], ...recordData};
                    tableContents[foundRecordIndex] = newRecord;
                    fs.writeFileSync(this._collectionPath, JSON.stringify(tableContents));
                    response.status = Responses.SUCCESS;
                    response.data = [tableContents[foundRecordIndex]];
                    return response;
                } else {
                    response.errors.push(new Error(`Could not find it with id '${id}' in table '${this._collectionName}'`));
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

    public removeRecord(id:string): ICollectionResponse {
        const response:ICollectionResponse = this.getInitialResponse();
        try {
            const tableContentsRaw = fs.readFileSync(this._collectionPath);
            if(tableContentsRaw) {
                const tableContents = JSON.parse(tableContentsRaw as unknown as string) as Record<string, unknown>[];
                const foundRecordIndex = tableContents.findIndex((record) => record._id === id);
                if(foundRecordIndex > -1) {
                    const recordCopy = cloneDeep(tableContents[foundRecordIndex]);
                    tableContents.splice(foundRecordIndex, 1);
                    fs.writeFileSync(this._collectionPath, JSON.stringify(tableContents));
                    this._count--;
                    response.status = Responses.SUCCESS;
                    response.data = [recordCopy];
                    return response;
                }
                response.errors.push(new Error(`Could not find it with id '${id}' in table '${this._collectionName}'`));
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
        return this._collectionName;
    }

    public rename(newName:string):boolean {
        try {
            const newNamePath = this.getFullTablePath(newName);
            if(MockDb.exists(newNamePath)) {
                return false;
            }
            fs.renameSync(this.getFullTablePath(this._collectionName), newNamePath);
            this._collectionName = newName;
            this._collectionPath = this.getFullTablePath(newName);
            return true;
        } catch(e) {
            return false;
        }
    }

    private getInitialResponse(): ICollectionResponse {
        return {
            dbName: this.dbName, 
            collectionName: this._collectionName, 
            status:Responses.ERROR, 
            data:[],
            errors:[]
        };
    }

    private getFullTablePath(tableName:string):string {
        return `${this.dbPath}/${tableName}.json`;
    } 

    
}