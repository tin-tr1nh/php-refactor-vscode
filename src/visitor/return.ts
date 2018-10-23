import { Visitor } from "./Visitor";

export class GetPotentialReturnVarsVisitor implements Visitor {
    key: string;
    declaredVars: string[];
    usedVars: string[];

    constructor() {
        this.declaredVars = [];
        this.usedVars = [];
        this.key = "";
    }

    EnterNode(node: any): void {
        this.updateDeclaredVars(node);
        this.updateUsedVars(node);
    }

    GetChildrenVisitor(key: string): Visitor {
        this.key = key;
        return this;
    }

    LeaveNode() {

    }

    Result(): string[] {
        console.log("declaredVars ", this.declaredVars);
        console.log("usedVars ", this.usedVars);
        return this.declaredVars.filter(
            (value) => this.usedVars.indexOf(value) === -1
        );
    }

    updateUsedVars(node: any) {
        if (node.kind !== "variable") {
            return;
        }

        if (this.key === "assign-left") {
            return;
        }
        if (node.name !== undefined && node.name !== null) {
            this.usedVars.push(node.name);
        }
    }

    updateDeclaredVars(node: any) {
        // add var on the left of the assignment to the declared
        if (node.kind === "assign" &&
            node.left !== undefined &&
            node.left.kind === "variable") {
            this.declaredVars.push(node.left.name);
        }

        if (node.kind === "foreach") {

            if (node.value !== undefined && node.value.kind === "variable") {
                this.declaredVars.push(node.value.name);
            }

            if (node.key !== null && node.key.kind === "variable") {
                this.declaredVars.push(node.key.name);
            }
        }
    }
}