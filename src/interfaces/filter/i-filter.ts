export interface IDocumentFilter {
    $or?: IDocumentFilter[]
    $and?: IDocumentFilter[]
    [x: string | number | symbol]: unknown;
};