import { Process } from '@/domain/Process';
import { ProcessTransformer } from '@/domain/ProcessTransformer';

export class MacosProcessTransformer implements ProcessTransformer {
	regExp = {
		port: /:(\d{1,5}|\*)$/,
		process: /^(\S+)\s+(\d+)\s+(\S+)/,
		address: /\s(\S+)\s+([^:]+):(\d+|\*)/,
		protocol: /\s+(TCP|UDP)\s+/,
	};

	transform(input: string): Process[] {
		const lines = input.split('\n');
		const processes: Process[] = [];

		for (const line of lines) {
			if (!line.trim()) {
				continue;
			}

			const processMatch = this.regExp.process.exec(line);
			if (!processMatch) {
				continue;
			}
			const [, program, id] = processMatch;

			const protocolMatch = this.regExp.protocol.exec(line);
			if (!protocolMatch) {
				continue;
			}
			const [, protocol] = protocolMatch;

			const addressPart = line.split(protocol)[1].trim();
			const [localAddress, remoteAddress = '*:*'] = addressPart
				.split(' ')
				.filter(Boolean);

			const [localHost, localPort] = this.parseAddress(localAddress);
			const [remoteHost, remotePort] = this.parseAddress(remoteAddress);

			if (
				!id ||
				!program ||
				!localPort ||
				!localHost ||
				!remotePort ||
				!remoteHost
			) {
				continue;
			}

			if (isNaN(+localPort)) {
				continue;
			}

			processes.push(
				Process.fromPrimitives({
					id,
					program,
					protocol,
					localHost,
					localPort,
					remoteHost,
					remotePort,
					status: 'LISTEN',
				})
			);
		}

		return this.sort(processes);
	}

	parseAddress(address: string): [string, string] {
		const parts = address.split(':');
		const host = parts[0] || '*';
		const port = parts[1] || '*';
		return [host, port];
	}

	sort(processes: Process[]): Process[] {
		return processes.sort((a, b) => +a.local.port.value - +b.local.port.value);
	}
}
