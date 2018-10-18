"use strict";
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import * as refactor from "./refactor";

function handleExtractFunctionEvent(handler: (text: string)=>string) {
        // The code you place here will be executed every time your command is executed

        let editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage("There is no open window");
            return; // No open text editor
        }

        let selection = editor.selection;
        let text = editor.document.getText(selection);

        editor.edit(builder => {
            try {
                const code = handler(text);
                builder.replace(selection, code);
            } catch (error) {
                console.log(error);
                vscode.window.showErrorMessage("選んだコード部分はシンタックスエラーです");
            }

        });
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
        handleExtractFunctionEvent(refactor.extractFunc);
    });

    let disposable2 = vscode.commands.registerCommand('php.extractFunctionWithComment', () => {
        handleExtractFunctionEvent(refactor.extractFuncWithComment);
    });

    context.subscriptions.push(disposable, disposable2);
}

// this method is called when your extension is deactivated
export function deactivate() { }
