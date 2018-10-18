const UnParser = require('php-unparser');
import * as tracer from "./tracer";

function toVariableNode(name: string): any {
    return {
        kind: "variable",
        name: name
    };
}

export function wrapByFunction(ast: any): any {
    const params = tracer.obtainPotentialParams(ast);
    const paramNodes = params.map(param => {
        return toVariableNode(param);
    });
    console.log(paramNodes);

    const funcWrapAST = [{
        kind: "function",
        name: "refactorFunc",
        arguments: paramNodes,
        body: {
            kind: "block",
            children: ast.children
        }
    }];
    ast.children = funcWrapAST;

    return ast;
}

export function writeToStr(ast: any): string {
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