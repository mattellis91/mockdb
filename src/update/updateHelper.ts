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
                case UpdateOperators.Increment:
                case UpdateOperators.Multiply:
                    this.manipulateDocumentForNumberOperation(newDocument, updateFilter[operator] as Record<string, number>, operator);
                    break;
                case UpdateOperators.Min:
                case UpdateOperators.Max:
                    this.manipulateDocumentForMinMaxOperation(newDocument, updateFilter[operator] as Record<string, number>, operator);
                    break;
                default:
                    throw new Error(`Unknown update operator '${operator}'`);
            }
        }
        return newDocument;
    }

    private manipulateDocmentForSetOperation(document:Record<string,unknown>, setFilter:Record<string, unknown>) {
        for(const prop of Object.keys(setFilter)) {
            document[prop] = setFilter[prop];
        }
    }

    private manipulateDocumentForNumberOperation(document:Record<string, unknown>, incrementFilter:Record<string,number>, operator:UpdateOperators) {
        for(const prop of Object.keys(incrementFilter)) {
            if(typeof(incrementFilter[prop]) !== 'number'){
                throw new Error(`Cannot peform ${operator} using filter value ${incrementFilter[prop]}. Value must be a number`);
            }
            if(document[prop] !== undefined) {
                if(document[prop] === null){
                    throw new Error(`Cannot peform ${operator} using a document value that is null for property '${prop}'`);
                } else if(typeof(document[prop]) !== 'number') {
                    throw new Error(`Cannot peform ${operator} using document value '${document[prop]}'. Value must be a number`);
                }
                switch(operator){
                    case UpdateOperators.Increment:
                        (document[prop] as number) += incrementFilter[prop];
                        break;
                    case UpdateOperators.Multiply:
                        (document[prop] as number) *= incrementFilter[prop];
                        break;
                    default:
                        throw new Error(`Unknown update operator '${operator}'`);
                }
            } else {
                document[prop] = incrementFilter[prop];
            }
        }
    }

    private manipulateDocumentForMinMaxOperation(document:Record<string,unknown>, minMaxFilter:Record<string,number>, operator:UpdateOperators) {
        for(const prop of Object.keys(minMaxFilter)) {
            if(typeof(minMaxFilter[prop]) !== 'number'){
                throw new Error(`Cannot peform ${operator} using filter value ${minMaxFilter[prop]}. Value must be a number`);
            }
            if(document[prop] !== undefined) {
                if(typeof(document[prop]) !== 'number' && document[prop] !== null) {
                    throw new Error(`Cannot peform ${operator} using document value '${document[prop]}'. Value must be a number or null`);
                }
                switch(operator){
                    case UpdateOperators.Min:
                        if(minMaxFilter[prop] < (document[prop] as number)) {
                            document[prop] = minMaxFilter[prop];
                        }
                        break;
                    case UpdateOperators.Max:
                        if(minMaxFilter[prop] > (document[prop] as number)) {
                            document[prop] = minMaxFilter[prop];
                        }
                        break;
                    default:
                        throw new Error(`Unknown update operator '${operator}'`);
                }      
            } else {
                document[prop] = minMaxFilter[prop];
            }
        }
    }
}