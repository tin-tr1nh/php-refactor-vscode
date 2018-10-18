import * as varWriter from "./var";

export function genCode(node: any): string {
    let params = "";
    if (node.arguments instanceof Array) {
        node.arguments.forEach((argument: string) => {
            if (params !== "") {
                params += ", " + varWriter.genCode(argument);
                return;
            }
            params += varWriter.genCode(argument);
            
        });
    }
    return `function ${node.name}(${params}) {
    }`;
}