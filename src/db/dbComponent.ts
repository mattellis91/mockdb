import { IDbComponent } from "../interfaces/db/i-dbComponent";

export class DbComponent implements IDbComponent {
    protected dbName:string;
    protected dbPath:string;

    constructor(dbName:string, dbPath:string) {
        this.dbName = dbName;
        this.dbPath = dbPath;
    }
}