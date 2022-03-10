import fs from 'fs';
import { DbComponent } from "./dbComponent";
import cuid from 'cuid';
import { MockDb } from './mockDb';
import { ICollection, ICollectionResponse, IDocumentFilter, IUpdateDocumentFilter } from '../interfaces';
import { Responses } from './responses';
import { cloneDeep } from 'lodash';
import * as util from 'util';
import { FilterHelper } from '../filter/filterHelper';

export class Collection extends DbComponent implements ICollection {
    private _collectionName:string;
    private _collectionPath:string;
    private _count:number;
    private _filterHelper:FilterHelper;
    constructor(dbName:string, dbPath:string, collectionName:string, newCollection:boolean) {
        super(dbName, dbPath);
        this._collectionName = collectionName;
        this._collectionPath = this.getFullCollectionPath(collectionName);
        this._filterHelper = new FilterHelper();
        if(newCollection) {
            this._count = 0;
        } else {
            try {
                const collectionContentsRaw = fs.readFileSync(this._collectionPath);
                if(collectionContentsRaw) {
                    this._count = Object.keys((JSON.parse(collectionContentsRaw as unknown as string) as Record<string, Record<string, unknown>>)).length;
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
            const collectionContentsRaw = fs.readFileSync(this._collectionPath);
            if(collectionContentsRaw) {
                const collectionContents = JSON.parse(collectionContentsRaw as unknown as string) as Record<string, Record<string, unknown>>;
                collectionContents[recordToInsert._id] = recordToInsert;
                fs.writeFileSync(this._collectionPath, JSON.stringify(collectionContents));
                this._count++;
                response.status = Responses.SUCCESS;
                response.data = [recordToInsert];
                return response
            } else {
                response.errors.push(new Error('Error reading contents of collection'));
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
            const collectionContentsRaw = fs.readFileSync(this._collectionPath);
            if(collectionContentsRaw) {
                const collectionContents = JSON.parse(collectionContentsRaw as unknown as string) as Record<string, Record<string, unknown>>;
                for(const record of recordsToInsert) {
                    collectionContents[record._id] = record;
                }
                fs.writeFileSync(this._collectionPath, JSON.stringify(collectionContents));
                this._count+=records.length;
                response.status = Responses.SUCCESS;
                response.data = recordsToInsert;
                return response;
            } else {
                response.errors.push(new Error('Error reading contents of collection'));
                return response;
            }
        } catch(e) {
            response.errors.push(e as Error);
            return response;
        }
    }

    public findById(id:string) : ICollectionResponse {
        const response:ICollectionResponse = this.getInitialResponse();
        try {
            const collectionContentsRaw = fs.readFileSync(this._collectionPath);
            if(collectionContentsRaw) {
                const collectionContents = JSON.parse(collectionContentsRaw as unknown as string) as Record<string, Record<string, unknown>>; 
                const foundItem = collectionContents[id];
                if(foundItem) {
                    response.status = Responses.SUCCESS;
                    response.data = [foundItem];
                    return response;
                } else {
                    response.errors.push(new Error(`Could not find it with id '${id}' in collection '${this._collectionName}'`));
                    return response;
                }
            } else {
                response.errors.push(new Error('Error reading contents of collection'));
                return response;
            }
        } catch(e) {
            response.errors.push(e as Error);
            return response;
        }
    };

    
    public find(filter?:IDocumentFilter): ICollectionResponse {
        const response:ICollectionResponse = this.getInitialResponse();
        try {
            const collectionContentsRaw = fs.readFileSync(this._collectionPath);
            const documentsMap = JSON.parse(collectionContentsRaw as unknown as string) as Record<string, Record<string, unknown>>;
            if(!filter) {
                const documents = this.convertMapToArray(documentsMap);
                response.status = Responses.SUCCESS;
                response.data = documents;
                return response;
            } else {
                console.log(this._filterHelper.findDocumentsByFilter(documentsMap,filter));
                return response;
            }
        } catch (e) {
            response.errors.push(e as Error);
            return response;
        }
    }

    public updateById(id:string, recordData:IUpdateDocumentFilter) : ICollectionResponse {
        const response:ICollectionResponse = this.getInitialResponse();
        try {
            const collectionContentsRaw = fs.readFileSync(this._collectionPath);
            if(collectionContentsRaw) {
                const collectionContents = JSON.parse(collectionContentsRaw as unknown as string) as Record<string, Record<string, unknown>>;
                const foundRecord = collectionContents[id] as Record<string, unknown>;
                if(foundRecord) {
                    const newRecord = {...foundRecord, ...recordData};
                    collectionContents[id] = newRecord;
                    fs.writeFileSync(this._collectionPath, JSON.stringify(collectionContents));
                    response.status = Responses.SUCCESS;
                    response.data = [newRecord];
                    return response;
                } else {
                    response.errors.push(new Error(`Could not find it with id '${id}' in collection '${this._collectionName}'`));
                    return response;
                }
            } else {
                response.errors.push(new Error('Error reading contents of collection'));
                return response;
            }
        } catch (e) {
            response.errors.push(e as Error);
            return response;
        }
    }

    public removeById(id:string): ICollectionResponse {
        const response:ICollectionResponse = this.getInitialResponse();
        try {
            const collectionContentsRaw = fs.readFileSync(this._collectionPath);
            if(collectionContentsRaw) {
                const collectionContents = JSON.parse(collectionContentsRaw as unknown as string) as Record<string, Record<string, unknown>>;
                const foundRecord = collectionContents[id];
                if(foundRecord) {
                    const recordCopy = cloneDeep(foundRecord);
                    delete collectionContents[id];
                    fs.writeFileSync(this._collectionPath, JSON.stringify(collectionContents));
                    this._count--;
                    response.status = Responses.SUCCESS;
                    response.data = [recordCopy];
                    return response;
                }
                response.errors.push(new Error(`Could not find it with id '${id}' in collection '${this._collectionName}'`));
                return response;
            }
            response.errors.push(new Error('Error reading contents of collection'));
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
            const newNamePath = this.getFullCollectionPath(newName);
            if(MockDb.exists(newNamePath)) {
                return false;
            }
            fs.renameSync(this.getFullCollectionPath(this._collectionName), newNamePath);
            this._collectionName = newName;
            this._collectionPath = this.getFullCollectionPath(newName);
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

    private getFullCollectionPath(collectionName:string):string {
        return `${this.dbPath}/${collectionName}.json`;
    }
    
    private convertMapToArray(documentMap:Record<string, Record<string, unknown>>): Record<string, unknown>[] {
        return Object.keys(documentMap).map((docId) => { return cloneDeep( documentMap[docId]) });
    }

    
}