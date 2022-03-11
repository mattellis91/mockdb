import { cloneDeep } from "lodash";
import { IUpdateDocumentFilter, IUpdateHelper } from "../interfaces";
import { UpdateOperators } from "./updateOperators";

export class UpdateHelper implements IUpdateHelper {

    public getUpdatedDocument(originalDocument:Record<string, unknown>, updateFilter:IUpdateDocumentFilter) {
        const updateOperators = Object.keys(updateFilter).filter((key) => key.startsWith('$'));
        const newDocument = cloneDeep(originalDocument);
        for(const operator of updateOperators) {
            switch(operator) {
                case UpdateOperators.Set:
                    this.manipulateDocmentForSetOperation(newDocument, updateFilter.$set as Record<string, unknown>);
                    break;
                default:
                    throw new Error(`Unknown query operator '${operator}'`);
            }
        }
        return newDocument;
    }

    private manipulateDocmentForSetOperation(document:Record<string,unknown>, setFilter:Record<string, unknown>) {
        for(const prop of Object.keys(setFilter)) {
            document[prop] = setFilter[prop];
        }
    }
}