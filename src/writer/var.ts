export function genCode(node: any): string {
    if(node.kind === "variable" && node.name !== undefined) {
        return `$${node.name}`;
    }

    return "";
}