import { ICollectionResponse } from "../repsonses";

export interface ICollection {
    insertOne(record:Record<string, unknown>): ICollectionResponse
    insertMany(records:Record<string, unknown>[]): ICollectionResponse
    findById(id:string) : ICollectionResponse
    updateRecordById(id:string, recordData:Record<string, unknown>) : ICollectionResponse
    count():number
    getName():string
    rename(newName:string):boolean
    retrieveRecords(query:string): ICollectionResponse
}