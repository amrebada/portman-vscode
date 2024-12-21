import * as vscode from 'vscode';
import { VSCommand } from './Command';
import { REFRESH_COMMAND } from '../Constants';
import { ProcessTreeDataProvider } from '../ProcessTreeDataProvider';

export class RefreshProcessesCommand extends VSCommand {
	register(): void {
		const command = vscode.commands.registerCommand(REFRESH_COMMAND, () => {
			(this.treeDataProvider as ProcessTreeDataProvider).setSearchText('');
			this.treeDataProvider.refresh();
		});

		this.context.subscriptions.push(command);
	}
}
