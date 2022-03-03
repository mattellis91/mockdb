export interface ITable {
    createTable(tableName:string): boolean   
    removeTable(tableName:string): boolean
   }