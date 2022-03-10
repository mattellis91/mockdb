import { Collection } from "../../db";

export interface IDB {
    collection(collectionName:string): Collection;
    dropCollection(collectionName:string): boolean;
    listCollections():string[];
}