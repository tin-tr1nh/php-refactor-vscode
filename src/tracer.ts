import {Scope} from "./model/Scope";
import { Visitor } from "./visitor/Visitor";
import { GetPotentialParamVisitor } from "./visitor/param";
import { GetPotentialReturnVarsVisitor } from "./visitor/return";


// these vars is global scope to function (usually)
// so we consider that it already in the function scope from beginning
const InScopeDefaultVars = ["this", "_SERVER"];

function walk(node: any, visitor: Visitor) {
    console.log(`Walk to node ${node.kind}-${node.name}`);
    visitor.EnterNode(node);
    // walk inside if possible 
    // through children (block), arguments, left, right, arguments (call), what,
    // body (foreach), source (foreach)

    if (node.children instanceof Array) {
        node.children.forEach((child: any) => {
            walk(child, visitor.GetChildrenVisitor(node.kind + "-child"));
        });
    }

    if (node.arguments instanceof Array) {
        node.arguments.forEach((argument: any) => {
            walk(argument, visitor.GetChildrenVisitor(node.kind + "-argument"));
        });
    }

    if (node.kind === "encapsed" && node.value instanceof Array) {
        node.value.forEach((value: any) => {
            walk(value, visitor.GetChildrenVisitor(node.kind + "-encapsed-value"));
        });
    }

    if (node.left !== undefined) {
        walk(node.left, visitor.GetChildrenVisitor(node.kind + "-left"));
    }

    if (node.right !== undefined) {
        walk(node.right, visitor.GetChildrenVisitor(node.kind + "-right"));
    }

    if (node.what !== undefined) {
        walk(node.what, visitor.GetChildrenVisitor(node.kind + "-what"));
    }

    if (node.source !== undefined) {
        walk(node.source, visitor.GetChildrenVisitor(node.kind + "-source"));
    }

    if (node.test !== undefined) {
        walk(node.test, visitor.GetChildrenVisitor(node.kind + "-test"));
    }

    if (node.alternate !== undefined && node.alternate !== null) {
        walk(node.alternate, visitor.GetChildrenVisitor(node.kind + "-alternate"));
    }

    if (node.body !== undefined) {
        walk(node.body, visitor.GetChildrenVisitor(node.kind + "-body"));
    }
}

export function obtainPotentialParams(ast: any): string[] {
    let initState: Scope = {
        vars: InScopeDefaultVars.slice(), // copy new array in order not to affect const array
        level: 0
    };

    let visitor = new GetPotentialParamVisitor(initState);
    walk(ast, visitor);
    return visitor.Result();
}

export function obtainPotentialReturnVars(ast: any): string[] {
    let visitor = new GetPotentialReturnVarsVisitor();
    walk(ast, visitor);
    return visitor.Result();
}