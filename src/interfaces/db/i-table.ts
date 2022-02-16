export interface ITable {
    createTable(tableName:string): Promise<number>   
    removeTable(tableName:string): Promise<number>
   }