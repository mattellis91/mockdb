import { Table } from "../..";

export interface IDB {
    table(tableName:string): Table;
}