import { TreeDataProvider, EventEmitter, TreeItem } from 'vscode';

import { ProcessTreeItem } from './ProcessTreeItem';
import { ProcessRepository } from '@/domain/ProcessRepository';
import { Process } from '@/domain/Process';
import { ProcessQuickPickItem } from './ProcessQuickPickItem';

export class ProcessTreeDataProvider
	implements TreeDataProvider<ProcessTreeItem>
{
	private _onDidChangeTreeData = new EventEmitter<
		ProcessTreeItem | undefined | void
	>();

	readonly onDidChangeTreeData = this._onDidChangeTreeData.event;
	private searchText: string = '';

	constructor(private readonly processRepository: ProcessRepository) {}

	setSearchText(text: string): void {
		this.searchText = text.toLowerCase();
		this.refresh();
	}

	refresh(): void {
		this._onDidChangeTreeData.fire();
	}

	async kill(port: Process): Promise<void> {
		await this.processRepository.kill(port);
	}

	getTreeItem(node: ProcessTreeItem): TreeItem {
		return node;
	}

	async getChildren(): Promise<ProcessTreeItem[]> {
		const processes = await this.processRepository.search();
		const filteredProcesses = this.searchText
			? processes.filter(
				(process) =>
					process.label.toLowerCase().includes(this.searchText) ||
					process.description.toLowerCase().includes(this.searchText)
			)
			: processes;
		const nodes = filteredProcesses.map((process) => new ProcessTreeItem(process));

		return nodes;
	}

	async getQuickItems(): Promise<ProcessQuickPickItem[]> {
		const processes = await this.processRepository.search();
		const items = processes.map((process) => new ProcessQuickPickItem(process));

		return items;
	}
}
