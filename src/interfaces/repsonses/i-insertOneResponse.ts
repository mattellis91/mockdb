export interface IInsertOneRepsonse {
    dbName:string,
    tableName:string,
    insertSuccessfull:boolean,
    record:Record<string, unknown>
}