import { cloneDeep, includes } from "lodash";
import { IUpdateDocumentFilter, IUpdateHelper } from "../interfaces";
import { UpdateOperators } from "./updateOperators";

export class UpdateHelper implements IUpdateHelper {

    public getUpdatedDocument(originalDocument:Record<string, unknown>, updateFilter:IUpdateDocumentFilter) {
        const ignoreOperators = ['upsert','$setOnInsert'];
        const updateOperators = Object.keys(updateFilter).filter((key) => !ignoreOperators.includes(key));
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
                case UpdateOperators.Unset:
                    this.manipulateDocumentForUnsetOperation(newDocument, updateFilter.$unset as Record<string, string>);
                    break;
                case UpdateOperators.Rename:
                    this.manipulateDocumentForRenameOperation(newDocument, updateFilter.$rename as Record<string, string>);
                    break;
                case UpdateOperators.AddToSet:
                    this.maniputateDocumentForAddToSetOperation(newDocument, updateFilter.$addToSet as Record<string, unknown>);
                    break;
                case UpdateOperators.Pop:
                    this.manipulateDocumentForPopOperation(newDocument, updateFilter.$pop as Record<string, -1 | 1>);
                    break;
                case UpdateOperators.Push:
                    this.manipulateDocumentForPushOperation(newDocument, updateFilter.$push as Record<string, unknown>);
                    break;
                case UpdateOperators.PullAll:
                    this.manipulateDocumentForPullAllOperation(newDocument, updateFilter.$pullAll as Record<string, unknown[]>);
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
                //TODO: why am i doing this if undefined????
                document[prop] = incrementFilter[prop];
            }
        }
    }

    private manipulateDocumentForMinMaxOperation(document:Record<string,unknown>, minMaxFilter:Record<string,number>, operator:UpdateOperators) {
        for(const prop of Object.keys(minMaxFilter)) {
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
                //TODO: why am i doing this if undefined????
                document[prop] = minMaxFilter[prop];
            }
        }
    }

    private manipulateDocumentForUnsetOperation(document:Record<string, unknown>, unsetFilter:Record<string,string>) {
        for(const prop of Object.keys(unsetFilter)) {
            if(document[prop] !== undefined) {
                delete document[prop];
            }
        }
    }

    private manipulateDocumentForRenameOperation(document:Record<string,unknown>, renameFilter:Record<string,string>) {
        for(const prop of Object.keys(renameFilter)){
            if(document[prop] !== undefined) {
                document[renameFilter[prop]] = document[prop];
                delete document[prop];
            }
        }       
    }

    public manipulateDocumentOnInsert(document:Record<string, unknown>, setOnInsertFilter:Record<string, unknown>): void {
        for(const prop of Object.keys(setOnInsertFilter)) {
            document[prop] = setOnInsertFilter[prop];
        }
    }

    private maniputateDocumentForAddToSetOperation(document:Record<string,unknown>, addToSetFilter:Record<string,unknown>) : void {
        for(const prop of Object.keys(addToSetFilter)) {
            if(!Array.isArray(document[prop])) {
                throw new Error(`Cannot peform $addToSet using document value '${document[prop]}'. Value must be an array`);
            }
            if(!(document[prop] as unknown[]).includes(addToSetFilter[prop])) {
                (document[prop] as unknown[]).push(addToSetFilter[prop]);
            }
        }
    }

    private manipulateDocumentForPopOperation(document:Record<string, unknown>, popFilter:Record<string, -1 | 1>) : void {
        for(const prop of Object.keys(popFilter)) {
            if(!Array.isArray(document[prop])) {
                throw new Error(`Cannot peform $pop using document value '${document[prop]}'. Value must be an array`);
            }
            popFilter[prop] === -1 ? (document[prop] as unknown[]).shift() : (document[prop] as unknown[]).pop();  
        }
    }

    private manipulateDocumentForPushOperation(document:Record<string, unknown>, pushFilter:Record<string, unknown>) : void {
        for(const prop of Object.keys(pushFilter)) {
            if(!Array.isArray(document[prop])) {
                throw new Error(`Cannot peform $push using document value '${document[prop]}'. Value must be an array`);
            }
            (document[prop] as unknown[]).push(pushFilter[prop]);
        }
    }

    private manipulateDocumentForPullAllOperation(document:Record<string,unknown>, pullAllFilter:Record<string, unknown[]>) : void {
        for(const prop of Object.keys(pullAllFilter)) {
            if(!Array.isArray(document[prop])) {
                throw new Error(`Cannot peform $push using document value '${document[prop]}'. Value must be an array`);
            }
            let i = (document[prop] as unknown[]).length;
            while(i--) {
               if((pullAllFilter[prop] as unknown[]).includes((document[prop] as unknown[])[i])) {
                   (document[prop] as unknown[]).splice(i,1);
               } 
            }
        }
    }
}