import { isObject, cloneDeep, filter } from "lodash";
import { IDocumentFilter, IFilterHelper } from "../interfaces/filter";
import { filterOperators } from "./filterOperators";

export class FilterHelper implements IFilterHelper{

    public findDocumentsByFilter(documentsMap:Record<string, Record<string, unknown>>, filterDocumentFilter:IDocumentFilter, findOne = false) : Record<string, unknown>[] {
        const documentsToReturn:Record<string, unknown>[] = [];
        for(const documentKey of Object.keys(documentsMap)) {
            let passes = true;
            for(const filterKey of Object.keys(filterDocumentFilter)) {

                if(filterKey === filterOperators.And) {
                    andLoop: for(const documentFilter of filterDocumentFilter[filterKey] as IDocumentFilter[]) {
                        if(this.findDocumentsByFilter(documentsMap, documentFilter).find((doc) => documentKey === doc._id) === undefined) {
                            passes = false;
                            break andLoop;
                        }
                    }
                }

                else if(filterKey === filterOperators.Or) {
                    let orPasses = false;
                    orLoop: for(const documentFilter of filterDocumentFilter[filterKey] as IDocumentFilter[]) {
                        if(this.findDocumentsByFilter(documentsMap, documentFilter).find((doc) => documentKey === doc._id) !== undefined) {
                            orPasses = true;
                            break orLoop;
                        }
                    }
                    passes = orPasses; 
                }

                else if(isObject(filterDocumentFilter[filterKey])) {
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

    private documentPropertyValueEqualsLiteralValue(documentPropValue: unknown, filterValue:unknown): boolean {
        return documentPropValue === filterValue;
    }
    
    private documentPropertyValueNotEqualsLiteralValue(documentPropValue: unknown, filterValue:unknown): boolean {
        return documentPropValue !== filterValue;
    }

    private evaluateFilterQuery(documentPropValue: unknown, query:Record<string, unknown>) : boolean {
        const queryKey = Object.keys(query)[0];
        const queryValue = query[queryKey]; 
        switch(queryKey) {
            case filterOperators.EqualTo:
                return this.documentPropertyValueEqualsLiteralValue(documentPropValue, queryValue);
            case filterOperators.NotEqualTo:
                return this.documentPropertyValueNotEqualsLiteralValue(documentPropValue, queryValue);
            case filterOperators.GreaterThan:
            case filterOperators.GreaterThanOrEqual:
            case filterOperators.LessThan:
            case filterOperators.LessThanOrEqualTo:
                return this.evaluateNumericalComparison(documentPropValue, queryValue, queryKey);
            case filterOperators.In:
            case filterOperators.NotIn:
                return this.evaluateArrayIncludes(documentPropValue, queryValue, queryKey);
            case filterOperators.Exists:
                return this.evaulateValueExists(documentPropValue, queryValue);
            case filterOperators.Contains:
                return this.evaluateContains(documentPropValue, queryValue as Record<string, unknown>);
            default:
                throw new Error(`Unknown query operator '${queryKey}'`);
        }
    }

    private evaluateNumericalComparison(documentPropValue: unknown, filterValue:unknown, operator:filterOperators): boolean {
        const documentValueType = typeof(documentPropValue);
        const valueType = typeof(filterValue);
        if(documentValueType === 'object' || valueType === 'object') {
            throw new Error(`cannot peform operation ${operator} against values of type object`);
        }
        switch(operator) {
            case filterOperators.GreaterThan:    
                return (documentPropValue as number | string) > (filterValue as number | string);
            case filterOperators.GreaterThanOrEqual:
                return (documentPropValue as number | string) >= (filterValue as number | string);
            case filterOperators.LessThan:
                return (documentPropValue as number | string) < (filterValue as number | string);
            case filterOperators.LessThanOrEqualTo:
                return (documentPropValue as number | string) <= (filterValue as number | string);
            default:
                throw new Error(`Unknown query operator '${operator}'`);
        }
    }

    private evaluateArrayIncludes(documentPropValue: unknown, filterValue:unknown, operator:string): boolean {
        if(!Array.isArray(filterValue)) {
            throw new Error(`cannot peform operation ${operator} using a filter value that is not an array`);
        }
        switch(operator){
            case filterOperators.In:
                return (filterValue as unknown[]).includes(documentPropValue);
            case filterOperators.NotIn:
                return !(filterValue as unknown[]).includes(documentPropValue);
            default:
                throw new Error(`Unknown query operator '${operator}'`);
        }
    }

    private evaulateValueExists(documentPropValue: unknown, filterValue:unknown): boolean {
        return filterValue ? documentPropValue !== undefined : documentPropValue === undefined;
    }

    private evaluateContains(documentPropValue: unknown, contains:Record<string, unknown>): boolean {
        if(([null,undefined] as unknown[]).includes(documentPropValue)){ return false; }
        if(typeof(documentPropValue) !== 'string'){
            throw new Error(`cannot peform operation $contains against values that are not of type string`);
        }
        let searchTerms = contains.$terms as string[];
        if(!contains.$caseSensitive) {
            searchTerms = searchTerms.map((term) => term.toLowerCase());
            documentPropValue = (documentPropValue as string).toLowerCase();
        }
        for(const term of searchTerms) {
            if((documentPropValue as string).includes(term)) {
                return true;
            }
        }
        return false;
    }
}