export interface IUpdateDocumentFilter {
    $set?: Record<string, unknown>
    $inc?: Record<string, number>
    $mul?: Record<string, number>
    $min?: Record<string, number>
    $max?: Record<string, number>
    $unset?: Record<string, string>
    $rename?: Record<string, string>
    $addFields? : Record<string , unknown>
    $setOnInsert?: Record<string, unknown>
    upsert? : boolean
}