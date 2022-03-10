import { isObject, cloneDeep } from "lodash";
import { IDocumentFilter, IFilterHelper } from "../interfaces/filter";

export class FilterHelper implements IFilterHelper{

    public findDocumentsByFilter(documentsMap:Record<string, Record<string, unknown>>, filterDocumentFilter:IDocumentFilter) : Record<string, unknown>[] {
        const documentsToReturn:Record<string, unknown>[] = [];
        console.log(documentsMap);
        for(const documentKey of Object.keys(documentsMap)) {
            for(const filterKey of Object.keys(filterDocumentFilter)) {
                if(isObject(filterDocumentFilter[filterKey])) {
                    continue;
                } else {
                    if(this.documentPropertyValueEqualsLiteralValue(documentsMap[documentKey][filterKey], filterDocumentFilter[filterKey])) {
                        documentsToReturn.push(cloneDeep(documentsMap[documentKey]));
                    };
                }
            }
        }
        return documentsToReturn;
    } 

    private documentPropertyValueEqualsLiteralValue(documentPropValue: unknown, value:unknown): boolean {
        return documentPropValue === value;
    }
}