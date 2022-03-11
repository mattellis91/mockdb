export interface IUpdateDocumentFilter {
    $set?: Record<string, unknown>
    $inc?: Record<string, Record<string, number>>
    $addFields? : Record<string , unknown>
    upsert? : boolean
}