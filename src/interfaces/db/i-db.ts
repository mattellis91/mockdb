export interface IDB {
 createDb(dbName:string): Promise<number>   
 removeDb(dbName:string): Promise<number>
}