export function genCode(returnVars: string[]): string {
    if (returnVars.length === 0) {
        return "";
    }

    let listStr = returnVars.map(value => `$${value}`).join(",");
    return `return array(${listStr})`;
}