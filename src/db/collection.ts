import fs from 'fs';
import { DbComponent } from "./dbComponent";
import cuid from 'cuid';
import { MockDb } from './mockDb';
import { ICollection, ICollectionResponse, IDocumentFilter, IUpdateDocumentFilter } from '../interfaces';
import { Responses } from './responses';
import { cloneDeep } from 'lodash';
import * as util from 'util';
import { FilterHelper } from '../filter/filterHelper';
import { UpdateHelper } from '../update';

export class Collection extends DbComponent implements ICollection {
    private _collectionName:string;
    private _collectionPath:string;
    private _count:number;
    private _filterHelper:FilterHelper;
    private _updateHelper:UpdateHelper;
    constructor(dbName:string, dbPath:string, collectionName:string, newCollection:boolean) {
        super(dbName, dbPath);
        this._collectionName = collectionName;
        this._collectionPath = this.getFullCollectionPath(collectionName);
        this._filterHelper = new FilterHelper();
        this._updateHelper = new UpdateHelper();
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
        return this.executeFindOperationWithFilter(filter, false);
    }

    public findOne(filter:IDocumentFilter): ICollectionResponse {
        return this.executeFindOperationWithFilter(filter, true);
    }

    private executeFindOperationWithFilter(filter:IDocumentFilter | undefined, findOne:boolean): ICollectionResponse {
        const response:ICollectionResponse = this.getInitialResponse();
        try {
            const collectionContentsRaw = fs.readFileSync(this._collectionPath);
            if(collectionContentsRaw) {
                const documentsMap = JSON.parse(collectionContentsRaw as unknown as string) as Record<string, Record<string, unknown>>;
                if(!filter) {
                    const documents = this.convertMapToArray(documentsMap);
                    response.status = Responses.SUCCESS;
                    response.data = documents;
                    return response;
                } else {
                    response.data = this._filterHelper.findDocumentsByFilter(documentsMap,filter, findOne);
                    response.status = Responses.SUCCESS;
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

    public updateById(id:string, updateFilter:IUpdateDocumentFilter) : ICollectionResponse {
        const response:ICollectionResponse = this.getInitialResponse();
        try {
            const collectionContentsRaw = fs.readFileSync(this._collectionPath);
            if(collectionContentsRaw) {
                const collectionContents = JSON.parse(collectionContentsRaw as unknown as string) as Record<string, Record<string, unknown>>;
                const foundRecord = collectionContents[id] as Record<string, unknown>;
                if(foundRecord) {
                    const newRecord = this._updateHelper.getUpdatedDocument(foundRecord, updateFilter);
                    collectionContents[id] = newRecord;
                    fs.writeFileSync(this._collectionPath, JSON.stringify(collectionContents));
                    response.status = Responses.SUCCESS;
                    response.data = [newRecord];
                    return response;
                } else {
                    if(updateFilter.upsert) {
                        const newDocument = this._updateHelper.getUpdatedDocument({_id:id}, updateFilter);
                        if(updateFilter.$setOnInsert) {
                            this._updateHelper.manipulateDocumentOnInsert(newDocument, updateFilter.$setOnInsert);
                        }
                        collectionContents[id] = newDocument;
                        fs.writeFileSync(this._collectionPath, JSON.stringify(collectionContents));
                        response.status = Responses.SUCCESS;
                        response.data = [newDocument];
                        this._count++;
                        return response;
                    }
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

    public updateOne(filter:IDocumentFilter, updateFilter:IUpdateDocumentFilter): ICollectionResponse {
        return this.executeUpdateOperationWithFilter(filter,updateFilter,true);
    }

    public update(filter:IDocumentFilter, updateFilter:IUpdateDocumentFilter):ICollectionResponse {
        return this.executeUpdateOperationWithFilter(filter,updateFilter, false);
    }

    public replaceById(id:string, document:Record<string, unknown>, upsert:boolean): ICollectionResponse {
        const response:ICollectionResponse = this.getInitialResponse();
        try {
            const collectionContentsRaw = fs.readFileSync(this._collectionPath);
            if(collectionContentsRaw) {
                const collectionContents = JSON.parse(collectionContentsRaw as unknown as string) as Record<string, Record<string, unknown>>;
                const foundRecord = collectionContents[id] as Record<string, unknown>;
                if(foundRecord) {
                    const newRecord = {_id:foundRecord._id, ...document};
                    collectionContents[id] = newRecord;
                    fs.writeFileSync(this._collectionPath, JSON.stringify(collectionContents));
                    response.status = Responses.SUCCESS;
                    response.data = [newRecord];
                    return response;
                } else {
                    if(upsert) {
                        const newDocument = {_id:id, ...document};
                        collectionContents[id] = newDocument;
                        fs.writeFileSync(this._collectionPath, JSON.stringify(collectionContents));
                        response.status = Responses.SUCCESS;
                        response.data = [newDocument];
                        this._count++;
                        return response;
                    }
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

    public replaceOne(filter:IDocumentFilter, document:Record<string,unknown>, upsert:boolean): ICollectionResponse {
        return this.executeReplaceOperationWithFilter(filter,document,true,upsert);
    }

    public replace(filter:IDocumentFilter, document:Record<string,unknown>, upsert:boolean): ICollectionResponse {
        return this.executeReplaceOperationWithFilter(filter,document,false,upsert);
    }

    private executeReplaceOperationWithFilter(filter:IDocumentFilter, document:Record<string,unknown>, replaceOne:boolean, upsert:boolean) {
        const response:ICollectionResponse = this.getInitialResponse();
        if(!Object.keys(filter).length) {
            response.errors.push(new Error(`No filter set for retrieving documents`));
            return response;
        }
        try {
            const collectionContentsRaw = fs.readFileSync(this._collectionPath);
            if(collectionContentsRaw) {
                const collectionContents = JSON.parse(collectionContentsRaw as unknown as string) as Record<string, Record<string, unknown>>;
                const foundDocuments = this._filterHelper.findDocumentsByFilter(collectionContents,filter, replaceOne);
                response.status = Responses.SUCCESS;
                if(foundDocuments.length) {
                    const newDocuments = [];
                    for(const doc of foundDocuments) {
                        const newDocument = {_id:doc._id, ...document};
                        collectionContents[newDocument._id as string] = newDocument;
                        newDocuments.push(newDocument);
                    }
                    fs.writeFileSync(this._collectionPath, JSON.stringify(collectionContents));
                    response.data = newDocuments;
                    return response;
                } else {
                    if(upsert) {
                        const newId = cuid();
                        const newDocument = {_id:newId, ...document};
                        collectionContents[newId] = newDocument;
                        fs.writeFileSync(this._collectionPath, JSON.stringify(collectionContents));
                        response.data = [newDocument];
                        this._count++;
                        return response;
                    }
                    return response;
                }
            } else {
                response.errors.push(new Error('Error reading contents of collection'));
                return response;
            }
        }  catch(e) {
            response.errors.push(e as Error);
            return response;
        }
    }

    private executeUpdateOperationWithFilter(filter:IDocumentFilter, updateFilter:IUpdateDocumentFilter, updateOne:boolean) {
        const response:ICollectionResponse = this.getInitialResponse();
        if(!Object.keys(filter).length) {
            response.errors.push(new Error(`No filter set for retrieving documents`));
            return response;
        }
        try {
            const collectionContentsRaw = fs.readFileSync(this._collectionPath);
            if(collectionContentsRaw) {
                const collectionContents = JSON.parse(collectionContentsRaw as unknown as string) as Record<string, Record<string, unknown>>;
                const foundDocuments = this._filterHelper.findDocumentsByFilter(collectionContents,filter, updateOne);
                response.status = Responses.SUCCESS;
                if(foundDocuments.length) {
                    const newDocuments = [];
                    for(const doc of foundDocuments) {
                        const newDocument = this._updateHelper.getUpdatedDocument(doc, updateFilter);
                        collectionContents[newDocument._id as string] = newDocument;
                        newDocuments.push(newDocument);
                    }
                    fs.writeFileSync(this._collectionPath, JSON.stringify(collectionContents));
                    response.data = newDocuments;
                    return response;
                } else {
                    if(updateFilter.upsert) {
                        const newId = cuid();
                        const newDocument = this._updateHelper.getUpdatedDocument({_id:newId}, updateFilter);
                        if(updateFilter.$setOnInsert) {
                            this._updateHelper.manipulateDocumentOnInsert(newDocument, updateFilter.$setOnInsert);
                        }
                        collectionContents[newId] = newDocument;
                        fs.writeFileSync(this._collectionPath, JSON.stringify(collectionContents));
                        response.data = [newDocument];
                        this._count++;
                        return response;
                    }
                    return response;
                }
            } else {
                response.errors.push(new Error('Error reading contents of collection'));
                return response;
            }
        }  catch(e) {
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

    public removeOne(filter:IDocumentFilter): ICollectionResponse {
        return this.executeRemoveOperationWithFilter(filter, true);
    }

    public remove(filter:IDocumentFilter):ICollectionResponse {
        return this.executeRemoveOperationWithFilter(filter, false);
    }

    private executeRemoveOperationWithFilter(filter:IDocumentFilter, removeOne:boolean) {
        const response:ICollectionResponse = this.getInitialResponse();
        if(!Object.keys(filter).length) {
            response.errors.push(new Error(`No filter set for retrieving documents`));
            return response;
        }
        try {
            const collectionContentsRaw = fs.readFileSync(this._collectionPath);
            if(collectionContentsRaw) {
                const collectionContents = JSON.parse(collectionContentsRaw as unknown as string) as Record<string, Record<string, unknown>>;
                const foundDocuments = this._filterHelper.findDocumentsByFilter(collectionContents,filter, removeOne);
                response.status = Responses.SUCCESS;
                for(const doc of foundDocuments) {
                    delete collectionContents[doc._id as string];
                }
                fs.writeFileSync(this._collectionPath, JSON.stringify(collectionContents));
                response.data = foundDocuments;
                this._count -= foundDocuments.length;
                return response;
            } else {
                response.errors.push(new Error('Error reading contents of collection'));
                return response;
            }
        }  catch(e) {
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