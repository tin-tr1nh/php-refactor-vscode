import {Scope} from "./Scope";


// these vars is global scope to function (usually)
// so we consider that it already in the function scope from begining
const InScopeDefaultVars = ["this", "_SERVER"];


function cloneScope(scope: Scope): Scope {
    var newScope: Scope = {
            vars: scope.vars.slice(),
            level: scope.level
        };
        
        return newScope;
}

function spawnInnerScopeVars(node: any): string[] {
    const innerScopeVars = [];

    if (node.kind === "foreach") {

        if (node.value !== undefined && node.value.kind === "variable") {
            innerScopeVars.push(node.value.name);
        }

        if (node.key !== null && node.key.kind === "variable") {
            innerScopeVars.push(node.key.name);
        }
    }
    return innerScopeVars;
}

function updateScopeVars(node: any, scope: Scope) {
    // assign will create new vars 
    // in the state of the current scope
    // add var on the left of the assignment to the state
    if (node.kind === "assign" &&
        node.left !== undefined &&
        node.left.kind === "variable") {
        scope.vars.push(node.left.name);
    }
}

function updatePotentialParams(node: any, scope: Scope, potentialParams: string[]) {
    // check if current node is variable kind
    // and not in current state, it could be the potential parameters to refactor
    if (node.kind === "variable" &&
        scope.vars.indexOf(node.name) === -1 &&
        potentialParams.indexOf(node.name) === -1) {
        potentialParams.push(node.name);
    }
}

function walk(node: any, scope: Scope, potentialParams: string[], innerScopeVars: string[]) {
    console.log(`Walk to node ${node.kind}-${node.name}, can see vars ${scope.vars}`);
    scope.vars.push(...innerScopeVars);

    // if this create new vars for the inner scope
    // create new this var to pass into next call
    innerScopeVars = spawnInnerScopeVars(node);

    // if this node create new vars in this scope
    // push those into scope.vars
    updateScopeVars(node, scope);

    // check if this node could be refactor
    // as a parameters of refactored function
    updatePotentialParams(node, scope, potentialParams);
    

    // after check walk inside if possible 
    // through children (block), arguments, left, right, arguments (call), what,
    // body (foreach), source (foreach)

    if (node.children !== undefined && node.children instanceof Array) {
        node.children.forEach((child: any) => {
            walk(child, scope, potentialParams, innerScopeVars);
        });
    }

    if (node.arguments !== undefined && node.arguments instanceof Array) {
        node.arguments.forEach((child: any) => {
            walk(child, scope, potentialParams, innerScopeVars);
        });
    }

    if (node.left !== undefined) {
        walk(node.left, scope, potentialParams, innerScopeVars);
    }

    if (node.right !== undefined) {
        walk(node.right, scope, potentialParams, innerScopeVars);
    }

    if (node.what !== undefined) {
        walk(node.what, scope, potentialParams, innerScopeVars);
    }

    if (node.source !== undefined) {
        walk(node.source, scope, potentialParams, innerScopeVars);
    }

    if (node.body !== undefined) {
        // copy state to pass it to inner scope
        // because inner scope shouldn't change outer scope
        var innerScope: Scope = cloneScope(scope);
        walk(node.body, innerScope, potentialParams, innerScopeVars);
    }
}

export function obtainPotentialParams(ast: any): string[] {
    var potentialParams: string[] = [];
    var initState: Scope = {
        vars: InScopeDefaultVars.slice(),
        level: 0
    };
    walk(ast, initState, potentialParams, []);
    return potentialParams;
}