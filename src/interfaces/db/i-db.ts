import { Table } from "../..";

export interface IDB {
    table(tableName:string): Table;
    dropTable(tableName:string): boolean;
    listTables():string[];
}