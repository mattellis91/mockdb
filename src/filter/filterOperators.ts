//https://docs.mongodb.com/manual/reference/operator/query/
export enum filterOperators {

    //COMPARISON OPERATORS
    EqualTo = '$eq',
    GreaterThan = '$gt',
    GreaterThanOrEqual = '$gte',
    In = '$in',
    LessThan = '$lt',
    LessThanOrEqualTo = '$lte',
    NotEqualTo = '$ne',
    NotIn = '$nin',

    //LOGICAL OPERATORS
    And = '$and',
    Not = '$not',
    Nor = '$nor',
    Or = '$or',

    //ELEMENT OPERATORS
    Exists = '$exists',
    Type = '$type',

    //ARRAY OPERATORS
    All = '$all',
    elemMatch = '$elemMatch',
    Size = '$size',

    //EVALUATION OPERATORS
    Contains = '$contains'    
}