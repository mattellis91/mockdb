import { IInsertOneRepsonse } from "../repsonses";

export interface ITable {
    insertOne(record:Record<string, unknown>): IInsertOneRepsonse
    retrieveRecordById(id:string) : Record<string, unknown> | undefined
}