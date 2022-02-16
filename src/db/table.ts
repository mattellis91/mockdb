import { ITable } from "..";

export class Table implements ITable {
    public async createTable(tableName: string): Promise<number> {
        return 1;
    }

    public async removeTable(tableName: string): Promise<number> {
        return 1;
    }
}