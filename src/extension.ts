"use strict";
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";

const PhpParser = require('php-parser');
const UnParser = require('php-unparser');

// these vars is global scope to function (usually)
// so we consider that it already in the function scope from begining
const InScopeDefaultVars = ["this", "_SERVER"];

interface State {
    vars: string[];
    level: number;
}

function walk(node: any, state: State, potentialParams: string[]) {
    console.log(`Walk to node ${node.kind}-${node.name}, can see vars ${state.vars}`);

    // foreach
    // will create new scope, state of inner scope mustn't change
    // the state of outer scope, so create new state object
    if (node.kind === "foreach") {

        var newState: State = {
            vars: state.vars.slice(),
            level: state.level
        };
        newState.vars.push(node.value.name);
        state = newState;

        if (node.value !== undefined && node.value.kind === "variable") {
            state.vars.push(node.value.name);
        }
    }

    if (node.kind === "assign" &&
        node.left !== undefined &&
        node.left.kind === "variable") {
        state.vars.push(node.left.name);
    }

    // check if current node is variable kind
    // and not in current state, it could be the potential parameters to refactor
    if (node.kind === "variable" &&
        state.vars.indexOf(node.name) === -1 &&
        potentialParams.indexOf(node.name) === -1) {
        potentialParams.push(node.name);
    }

    // after check walk inside if possible 
    // through children (block), arguments, left, right, arguments (call), what,
    // body (foreach), source (foreach)

    if (node.children !== undefined && node.children instanceof Array) {
        node.children.forEach((child: any) => {
            walk(child, state, potentialParams);
        });
    }

    if (node.arguments !== undefined && node.arguments instanceof Array) {
        node.arguments.forEach((child: any) => {
            walk(child, state, potentialParams);
        });
    }

    if (node.left !== undefined) {
        walk(node.left, state, potentialParams);
    }

    if (node.right !== undefined) {
        walk(node.right, state, potentialParams);
    }

    if (node.what !== undefined) {
        walk(node.what, state, potentialParams);
    }

    if (node.source !== undefined) {
        walk(node.source, state, potentialParams);
    }

    if (node.body !== undefined) {
        // copy state to pass it to inner scope
        // because inner scope shouldn't change outer scope
        var innerState: State = {
            vars: state.vars.slice(), // create new array
            level: state.level
        };
        walk(node.body, innerState, potentialParams);
    }
}

function parseToAST(code: string): any {
    var parser = new PhpParser({
        parser: {
            extractDoc: true,
            php7: true
        },
        ast: {
            withPositions: true
        }
    });
    var ast = parser.parseEval(code);
    console.log(ast);

    return ast;
}

function obtainPotentialParams(ast: any): string[] {
    var potentialParams: string[] = [];
    var initState: State = {
        vars: InScopeDefaultVars.slice(),
        level: 0
    };
    walk(ast, initState, potentialParams);
    return potentialParams;
}

function toVariableNode(name: string): any {
    return {
        kind: "variable",
        name: name
    };
}

function wrapByFunction(ast: any): any {
    const params = obtainPotentialParams(ast);
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

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "php-refactor" is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('php.extractFunction', () => {
        // The code you place here will be executed every time your command is executed

        let editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage("There is no open window");
            return; // No open text editor
        }

        let selection = editor.selection;
        let text = editor.document.getText(selection);

        editor.edit(builder => {
            var ast = parseToAST(text);
            ast = wrapByFunction(ast);
            builder.replace(selection, writeToStr(ast));
        });
    });

    context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() { }
