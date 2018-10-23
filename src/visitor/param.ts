import { Scope } from "../model/Scope";
import { Visitor } from "./Visitor";

export class GetPotentialParamVisitor implements Visitor {
    scope: Scope;
    potentialParams: string[];
    innerScopeVars: string[];

    constructor(scope: Scope, potentialParams: string[] = []) {
        this.scope = scope;
        this.potentialParams = potentialParams;
        this.innerScopeVars = [];
    }

    EnterNode(node: any): void {
        updateScopeVars(node, this.scope);
        updatePotentialParams(node, this.scope, this.potentialParams);
        this.innerScopeVars.push(...spawnInnerScopeVars(node));
    }

    GetChildrenVisitor(key: string): Visitor {
        console.log("GetChildrenVisitor: " + key);
        if (key.includes("body")) {
            var innerScope: Scope = cloneScope(this.scope);
            innerScope.vars.push(...this.innerScopeVars);
            return new GetPotentialParamVisitor(innerScope, this.potentialParams);
        }

        return this;
    }

    LeaveNode() {

    }

    Result(): string[] {
        return this.potentialParams;
    }
}

function cloneScope(scope: Scope): Scope {
    var newScope: Scope = {
        vars: scope.vars.slice(),
        level: scope.level
    };

    return newScope;
}

// the foreach and similar one
// which create new variables for the scope inside
// check and create it here
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

// check if this node could create new variable
// for current scope
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

// check if current node is variable kind
// and not in current state, it could be the potential parameters to refactor
function updatePotentialParams(node: any, scope: Scope, potentialParams: string[]) {
    if (node.kind === "variable" &&
        scope.vars.indexOf(node.name) === -1 &&
        potentialParams.indexOf(node.name) === -1) {
        potentialParams.push(node.name);
    }
}