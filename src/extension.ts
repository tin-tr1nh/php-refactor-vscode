"use strict";
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import * as refactor from "./refactor";

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
            try {
                const code = refactor.extractFunc(text);
                builder.replace(selection, code);
            } catch (error) {
                console.log(error);
                vscode.window.showErrorMessage("選んだコード部分はシンタックスエラーです");
            }

        });
    });

    context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() { }
