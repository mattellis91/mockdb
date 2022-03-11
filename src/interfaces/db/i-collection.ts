import { IDocumentFilter } from "../filter";
import { ICollectionResponse } from "../repsonses";
import { IUpdateDocumentFilter } from "../update";

export interface ICollection {
    insertOne(record:Record<string, unknown>): ICollectionResponse
    insertMany(records:Record<string, unknown>[]): ICollectionResponse
    findById(id:string) : ICollectionResponse
    find(filter?:IDocumentFilter): ICollectionResponse
    findOne(filter:IDocumentFilter): ICollectionResponse
    updateById(id:string, recordData:Record<string, unknown>) : ICollectionResponse
    updateOne(filter:IDocumentFilter, updateFilter:IUpdateDocumentFilter): ICollectionResponse
    update(filter:IDocumentFilter, updateFilter:IUpdateDocumentFilter): ICollectionResponse
    count():number
    getName():string
    rename(newName:string):boolean
}