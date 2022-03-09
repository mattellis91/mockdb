import { Collection } from "../../db";

export interface IDB {
    collection(tableName:string): Collection;
    dropTable(tableName:string): boolean;
    listTables():string[];
}