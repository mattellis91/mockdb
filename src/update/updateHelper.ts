import { cloneDeep } from "lodash";
import { IUpdateHelper } from "../interfaces";

export class UpdateHelper implements IUpdateHelper {

    public getUpdatedDocument(originalDocument:Record<string, unknown>, setFilter:Record<string, unknown>) {
        const newDocument = cloneDeep(originalDocument);
        for(const prop of Object.keys(setFilter)) {
            newDocument[prop] = setFilter[prop];
        }
        return newDocument;
    }
}