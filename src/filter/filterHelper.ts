import { isObject, cloneDeep, filter } from "lodash";
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
}