import * as vscode from 'vscode';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';

import { Process } from '@/domain/Process';
import { ProcessRepository } from '@/domain/ProcessRepository';
import { MacosProcessTransformer } from './MacosProcessTransformer';
import { CommandExecutionError } from '@/shared/domain/exceptions/CommandExecutionError';

const execute = promisify(exec);
const command = {
	getAll: (asRootUser = false) => {
		const cmd = `lsof -nP -iTCP -sTCP:LISTEN | awk '{if(NR>1)print $1,$2,$3,$4,$8,$9}'`;
		return `${asRootUser ? 'sudo ' : ''}${cmd}`;
	},
	kill: (pid: string, asRootUser = false) => {
		const cmd = `kill ${pid}`;
		return `${asRootUser ? 'sudo ' : ''}${cmd}`;
	},
};

export class MacosProcessRepository implements ProcessRepository {
	async search(): Promise<Process[]> {
		const asRootUser = vscode.workspace
			.getConfiguration('portman.macos')
			.get<boolean>('asRootUser');

		const result = execute(command.getAll(asRootUser)).then(
			({ stdout, stderr }) => {
				if (stderr) {
					throw new CommandExecutionError(
						`The command executed has failed. ${stderr}`
					);
				}

				const transformer = new MacosProcessTransformer();
				const ports = transformer.transform(stdout);

				return ports;
			}
		);

		return result;
	}

	async kill(process: Process): Promise<void> {
		const asRootUser = vscode.workspace
			.getConfiguration('portman.macos')
			.get<boolean>('asRootUser');

		execute(command.kill(process.id.value, asRootUser)).then(({ stderr }) => {
			if (stderr) {
				throw new CommandExecutionError(
					`The command executed has failed. ${stderr}`
				);
			}
		});
	}
}
