
export interface Visitor {
    EnterNode(node: any): void;
    GetChildrenVisitor(key: string): Visitor;
    LeaveNode(): void;
}