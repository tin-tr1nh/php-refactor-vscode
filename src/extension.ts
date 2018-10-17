"use strict";
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
const PhpParser = require('php-parser');
const UnParser = require('php-unparser');

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

function extractParams(ast: any): Array<any> {
    return [];
}

function wrapByFunction(ast: any): any {
    const params = extractParams(ast);

    const funcWrapAST = [{
        kind: "function",
        name: "refactorFunc",
        arguments: params,
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
