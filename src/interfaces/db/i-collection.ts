import { ITableResponse } from "../repsonses";

export interface ICollection {
    insertOne(record:Record<string, unknown>): ITableResponse
    insertMany(records:Record<string, unknown>[]): ITableResponse
    retrieveRecordById(id:string) : ITableResponse
    updateRecordById(id:string, recordData:Record<string, unknown>) : ITableResponse
    count():number
    getName():string
    rename(newName:string):boolean
    retrieveRecords(query:string): ITableResponse
}