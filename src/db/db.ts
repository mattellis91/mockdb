import { MockDb, Collection } from ".";
import { IDB } from "..";
import fs from 'fs';

export class Db implements IDB {
    protected dbName:string;
    protected dbPath:string ;
    protected collections:string[] | undefined;
    
    constructor(dbName:string) {
        const dbPath = './mockdb/'+dbName;
        if(!MockDb.exists(dbPath)) {
            (async () => {
                await MockDb.createDb(dbName);
            })();
        }
        this.dbName = dbName;
        this.dbPath = dbPath
        this.collections = [];
    }

    public collection(collectionName:string):Collection {
        const collectionPath = this.getFullCollectionPath(collectionName);
        const fileContents = `{}`;
        if(!MockDb.exists(collectionPath)) {
            fs.writeFileSync(collectionPath, fileContents);
            return new Collection(this.dbName, this.dbPath, collectionName, true);
        } else {
            return new Collection(this.dbName, this.dbPath, collectionName, false);
        }
    }

    public dropCollection(collectionName:string):boolean {
        const collectionPath = this.getFullCollectionPath(collectionName);
        if(!MockDb.exists(collectionPath)) {
            return false;
        }
        fs.unlinkSync(collectionPath);
        return true;
    }

    public listCollections():string[] {
        const collectionNames:string[] = [];
        fs.readdirSync(this.dbPath).forEach(collection => {
            collectionNames.push(MockDb.removeExtensionFromFileName(collection));
        });
        return collectionNames;
    }

    private getFullCollectionPath(collectionName:string):string {
        return `${this.dbPath}/${collectionName}.json`;
    } 
}