export interface IUpdateDocumentFilter {
    $set?: Record<string, unknown>
    $addFields? : Record<string , unknown>
    $upsert? : boolean
}