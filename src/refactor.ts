const UnParser = require('php-unparser');
import * as tracer from "./tracer";

function genVar(name: string): any {
    return {
        kind: "variable",
        name: name
    };
}

function writeToStr(ast: any): string {
    var options = {
        indent: true,
        dontUseWhitespaces: false,
        shortArray: true,
        bracketsNewLine: true,
        forceNamespaceBrackets: false,
        collapseEmptyLines: true
    };

    return UnParser(ast, options);
}

function genFunc(name: string, params: string[]): string {
    const paramNodes = params.map(param => {
        return genVar(param);
    });
    console.log(paramNodes);

    const funcAST = {
        kind: "function",
        name: name,
        arguments: paramNodes,
        body: {
            kind: "block",
            children: []
        }
    };

    return writeToStr(funcAST);
}

export function extractFunc(ast: any, code: string): string {
    const params = tracer.obtainPotentialParams(ast);
    let funcCode = genFunc("newFunc", params);

    let afterCurlyBracketIndex = funcCode.indexOf("{") + 1;
    if (afterCurlyBracketIndex === -1) {
        return funcCode;
    }

    code = funcCode.slice(0, afterCurlyBracketIndex)
        + "\n" + code
        + funcCode.slice(afterCurlyBracketIndex);
    return code;
}