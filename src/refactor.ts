import * as tracer from "./tracer";
import * as commentGen from "./comment_gen";
import * as funcWriter from "./writer/function";
import * as returnWriter from "./writer/return";

const PhpParser = require('php-parser');

function parseToAST(code: string): any {
    const parser = new PhpParser({
        parser: {
            extractDoc: true,
            php7: true
        },
        ast: {
            withPositions: true
        }
    });
    const ast = parser.parseEval(code);
    console.log(ast);

    return ast;
}

// create a variable AST node
// base on its name
function makeVar(name: string): any {
    return {
        kind: "variable",
        name: name
    };
}

// gen a string code of a function
function genFunc(name: string, params: string[]): string {
    const paramNodes = params.map(param => {
        return makeVar(param);
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

    return funcWriter.genCode(funcAST);
}

function wrapCodeByFunc(code: string, params: string[]): string {
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

// wrap any code into a function
// auto generate parameter base on generated ast tree 
export function extractFunc(code: string): string {
    const ast = parseToAST(code);
    const params = tracer.obtainPotentialParams(ast);
    const returnVars = tracer.obtainPotentialReturnVars(ast);
    code += "\n" + returnWriter.genCode(returnVars);

    return wrapCodeByFunc(code, params);
}

export function extractFuncWithComment(code: string): string {
    const ast = parseToAST(code);
    const params = tracer.obtainPotentialParams(ast);

    let funcCode = wrapCodeByFunc(code, params);
    const commentCode = commentGen.generate("Description for function", params);
    funcCode = commentCode + funcCode;
    return funcCode;
}