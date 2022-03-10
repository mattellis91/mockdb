export interface IDocumentFilter {
    $or?: Record<string, unknown>
    $and?: Record<string, unknown>
    [x: string | number | symbol]: unknown;
};