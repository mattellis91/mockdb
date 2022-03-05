import { IQueryHelper } from "../interfaces";
import * as util from 'util';

export class QueryHelper implements IQueryHelper{

    public filterTableContents(tableContents:Record<string, unknown>[], where:Record<string, unknown>) {
        console.log(tableContents);
        console.log(util.inspect(where, true, null, true));
                        
    }
}