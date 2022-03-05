export interface ITableResponse {
    dbName:string,
    tableName:string,
    status:number,
    data:Record<string, unknown>[]
    errors:Error[]
}