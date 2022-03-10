export interface ICollectionResponse {
    dbName:string,
    collectionName:string,
    status:number,
    data:Record<string, unknown>[]
    errors:Error[]
}