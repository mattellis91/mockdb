import { IFilterHelper } from "../interfaces/filter";

export class FilterHelper implements IFilterHelper{

    // public filterTableContents(tableContents:Record<string, unknown>[], whereRootNode:Record<string, unknown>) {
    //     console.log(tableContents);
    //     console.log(util.inspect(whereRootNode, true, null, true));
    //     switch(whereRootNode.type) {
    //         case QueryExpressionType.BINARY_EXPRESSION:
    //             return this.evaulateBinaryExpression(whereRootNode);
    //     default:
    //         throw new Error('Unknown where clause expression type');
    //     }    
    // }

    // private evaulateBinaryExpression(node:Record<string, unknown>) {
    //     //left / right (value or ids of elements that meet the requirements of inner binary expression)
    //     const left = node.left !== QueryExpressionType.BINARY_EXPRESSION? node.left : node.left;
    //     const right = node.right !== QueryExpressionType.BINARY_EXPRESSION? node.right : node.right;
    // }

    // private getPassingRecordsForBinaryExpression(left:Record<string, unknown>,right:Record<string, unknown>, operator:string):string[] {
    //     return []
    // }

}