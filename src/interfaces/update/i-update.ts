export interface IUpdateDocumentFilter {
    $set?: Record<string, any>
    $addFields? : Record<string , any>
}