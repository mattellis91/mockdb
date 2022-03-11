import { cloneDeep, update } from "lodash";
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
                case UpdateOperators.Increment:
                    this.manipulateDocumentForIncrementOperation(newDocument, updateFilter.$inc as Record<string, number>);
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

    private manipulateDocumentForIncrementOperation(document:Record<string, unknown>, incrementFilter:Record<string,number>) {
        for(const prop of Object.keys(incrementFilter)) {
            if(typeof(incrementFilter[prop]) !== 'number'){
                throw new Error(`Cannot peform increment using filter value ${incrementFilter[prop]}. Value must be a number`);
            }
            if(document[prop] !== undefined) {
                if(document[prop] === null){
                    throw new Error(`Cannot peform increment using a document value that is null for property '${prop}'`);
                } else if(typeof(document[prop]) !== 'number') {
                    throw new Error(`Cannot peform increment using document value '${document[prop]}'. Value must be a number`);
                }
                (document[prop] as number) += incrementFilter[prop];
            } else {
                document[prop] = incrementFilter[prop];
            }
        }
    }
}