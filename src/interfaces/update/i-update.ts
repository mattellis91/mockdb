export interface IUpdateDocumentFilter {
    $set?: Record<string, unknown>
    $addFields? : Record<string , unknown>
    [x: string | number | symbol]: unknown;
}