export interface IUpdateHelper {
    getUpdatedDocument(originalDocument:Record<string, unknown>, setFilter:Record<string, unknown>): Record<string, unknown>
}