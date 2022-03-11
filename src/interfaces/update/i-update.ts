export interface IUpdateDocumentFilter {
    $set?: Record<string, unknown>
    $inc?: Record<string, number>
    $mul?: Record<string, number>
    $addFields? : Record<string , unknown>
    upsert? : boolean
}