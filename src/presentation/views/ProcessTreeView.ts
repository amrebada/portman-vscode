import * as vscode from 'vscode';
import { VSView } from './View';
import { ProcessTreeDataProvider } from '../ProcessTreeDataProvider';

export class ProcessTreeView extends VSView {
	register(): void {
		const treeView = vscode.window.createTreeView('portman', {
			treeDataProvider: this.treeDataProvider,
			showCollapseAll: false
		});

		// Add search box
		const searchBox = vscode.window.createInputBox();
		searchBox.placeholder = 'Search ports...';
		
		searchBox.onDidChangeValue((text) => {
			(this.treeDataProvider as ProcessTreeDataProvider).setSearchText(text);
		});

		// Show search box when clicking the search icon in view title
		const searchCommand = vscode.commands.registerCommand('portman.searchPorts', () => {
			searchBox.show();
		});

		this.context.subscriptions.push(treeView, searchCommand);
	}
}
