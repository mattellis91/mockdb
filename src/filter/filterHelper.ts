import { isObject, cloneDeep } from "lodash";
import { IDocumentFilter, IFilterHelper } from "../interfaces/filter";
import { filterOperators } from "./filterOperators";

export class FilterHelper implements IFilterHelper{

    public findDocumentsByFilter(documentsMap:Record<string, Record<string, unknown>>, filterDocumentFilter:IDocumentFilter, findOne = false) : Record<string, unknown>[] {
        const documentsToReturn:Record<string, unknown>[] = [];
        for(const documentKey of Object.keys(documentsMap)) {
            let passes = true;
            for(const filterKey of Object.keys(filterDocumentFilter)) {
                if(isObject(filterDocumentFilter[filterKey])) {
                    if(!this.evaluateFilterQuery(documentsMap[documentKey][filterKey], filterDocumentFilter[filterKey] as Record<string, unknown>)) {
                        passes = false;
                    }
                } else {
                    if(!this.documentPropertyValueEqualsLiteralValue(documentsMap[documentKey][filterKey], filterDocumentFilter[filterKey])) {
                        passes = false;
                    };
                }
            }
            if(passes) {
                documentsToReturn.push(cloneDeep(documentsMap[documentKey]));
                if(findOne) {return documentsToReturn;}
            }
        }
        return documentsToReturn;
    } 

    private documentPropertyValueEqualsLiteralValue(documentPropValue: unknown, value:unknown): boolean {
        return documentPropValue === value;
    }

    private evaluateFilterQuery(documentPropValue: unknown, query:Record<string, unknown>) : boolean {
        const queryKey = Object.keys(query)[0];
        const queryValue = query[queryKey]; 
        switch(queryKey) {
            case filterOperators.EqualTo:
                return this.documentPropertyValueEqualsLiteralValue(documentPropValue, queryValue)
            default:
                throw new Error('Failed to evaluate document filter')
        }
    }
}