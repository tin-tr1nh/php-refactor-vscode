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
    code = genFunc("newFunc", params);
    return code;
}