import { IDocumentFilter, IFilterHelper } from "../interfaces/filter";

export class FilterHelper implements IFilterHelper{

    public findDocumentsByFilter(filterDocumentFilter:IDocumentFilter) : Record<string, unknown> {
        return {}
    }

}