export interface IDB {
 createDb(dbName:string): Promise<number>   
}