export interface IInsertManyRepsonse {
    dbName:string,
    tableName:string,
    insertSuccessfull:boolean,
    records:Record<string, unknown>[]
}