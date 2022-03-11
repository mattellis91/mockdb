import { IUpdateDocumentFilter } from "./i-update";

export interface IUpdateHelper {
    getUpdatedDocument(originalDocument:Record<string, unknown>, updateFilter:IUpdateDocumentFilter): Record<string, unknown>
}